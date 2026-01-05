import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const cache = new Map();
const CACHE_TTL = 48 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

interface CachedResult {
  data: any;
  timestamp: number;
}

function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - (value as CachedResult).timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

function getCacheKey(zip: string | undefined, lat: number | undefined, lng: number | undefined, radius: number): string {
  if (zip) return `zip:${zip}:${radius}`;
  return `coords:${lat},${lng}:${radius}`;
}

function getCached(key: string): any | null {
  const cached = cache.get(key) as CachedResult | undefined;
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

function setCache(key: string, data: any): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    cleanExpiredCache();
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
  }
  cache.set(key, { data, timestamp: Date.now() });
}

async function geocodeZip(zip: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&key=${apiKey}`
  );
  const data = await response.json();
  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    return null;
  }
  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
}

function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

async function searchNearby(lat: number, lng: number, radiusMeters: number, apiKey: string): Promise<any[]> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&key=${apiKey}`
  );
  const data = await response.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Places API error:', data);
    return [];
  }
  return data.results || [];
}

function normalizeCategory(types: string[]): string {
  const categoryMap: Record<string, string> = {
    'pet_store': 'Pet Services',
    'veterinary_care': 'Pet Services',
    'restaurant': 'Food & Dining',
    'cafe': 'Food & Dining',
    'bakery': 'Food & Dining',
    'bar': 'Food & Dining',
    'gym': 'Fitness & Wellness',
    'spa': 'Fitness & Wellness',
    'beauty_salon': 'Beauty & Personal Care',
    'hair_care': 'Beauty & Personal Care',
    'car_repair': 'Automotive Services',
    'car_wash': 'Automotive Services',
    'electrician': 'Home Services',
    'plumber': 'Home Services',
    'locksmith': 'Home Services',
    'moving_company': 'Home Services',
    'real_estate_agency': 'Real Estate',
    'lawyer': 'Professional Services',
    'accounting': 'Professional Services',
    'dentist': 'Healthcare',
    'doctor': 'Healthcare',
    'pharmacy': 'Healthcare',
    'florist': 'Retail & Specialty',
    'jewelry_store': 'Retail & Specialty',
    'clothing_store': 'Retail & Specialty',
    'book_store': 'Retail & Specialty',
  };

  for (const type of types) {
    if (categoryMap[type]) return categoryMap[type];
  }
  return 'Other';
}

function groupByCategory(places: any[], radiusMiles: number): any[] {
  const grouped = new Map();

  for (const place of places) {
    const category = normalizeCategory(place.types || []);
    if (!grouped.has(category)) {
      grouped.set(category, {
        category,
        places: [],
        totalRating: 0,
        totalReviews: 0,
        count: 0,
      });
    }
    const group = grouped.get(category);
    group.places.push(place);
    group.totalRating += place.rating || 0;
    group.totalReviews += place.user_ratings_total || 0;
    group.count++;
  }

  const results = [];
  for (const [_, group] of grouped) {
    const ratingAvg = group.count > 0 ? group.totalRating / group.count : 0;
    const reviewsAvg = group.count > 0 ? group.totalReviews / group.count : 0;
    const supply = group.count;
    const supplyDensity = supply / radiusMiles;
    const demandIndex = Math.min(100, 40 + (reviewsAvg * 3 / 10) + (ratingAvg * 5));
    const normalizedDemand = demandIndex / 100;
    const normalizedSupply = Math.max(0.1, supply + reviewsAvg / 50);
    const score = (normalizedDemand * 1.0 * 1.0) / normalizedSupply;

    let why = 'Moderate opportunity in this area.';
    if (score > 0.5 && supply < 5) {
      why = `Above-avg demand with only ${supply} provider${supply === 1 ? '' : 's'} nearby.`;
    } else if (score > 0.3 && supply < 10) {
      why = `Good demand with ${supply} competitors—room for differentiation.`;
    } else if (supply > 20) {
      why = `High competition (${supply} providers), but demand may justify entry.`;
    }

    const suggestedPriceRange = ratingAvg > 4.0 ? '$$–$$$' : '$–$$';

    results.push({
      category,
      score: Math.round(score * 100) / 100,
      supply,
      ratingAvg: Math.round(ratingAvg * 10) / 10,
      reviewsAvg: Math.round(reviewsAvg),
      why,
      suggestedPriceRange,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, trial_end')
      .eq('id', user.id)
      .maybeSingle();

    const isPro = profile?.plan === 'pro' || (profile?.trial_end && new Date(profile.trial_end) > new Date());
    if (!isPro) {
      return new Response(
        JSON.stringify({ error: 'Upgrade required', code: 'PRO_REQUIRED' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { zip, lat, lng, radiusMiles, ideaName } = await req.json();
    const radius = radiusMiles || parseInt(Deno.env.get('LOCAL_RADIUS_MILES') || '5');

    let coords = { lat, lng };
    if (zip && !lat && !lng) {
      const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
      if (!googleApiKey) {
        return new Response(
          JSON.stringify({ error: 'Google API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const geocoded = await geocodeZip(zip, googleApiKey);
      if (!geocoded) {
        return new Response(
          JSON.stringify({ error: 'Could not geocode ZIP code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      coords = geocoded;
    }

    if (!coords.lat || !coords.lng) {
      return new Response(
        JSON.stringify({ error: 'Missing location data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cacheKey = getCacheKey(zip, coords.lat, coords.lng, radius);
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const places = await searchNearby(coords.lat, coords.lng, milesToMeters(radius), googleApiKey);
    const topCategories = groupByCategory(places, radius);

    const result = {
      top: topCategories,
      meta: { lat: coords.lat, lng: coords.lng, radiusMiles: radius, zip: zip || null },
    };

    await supabase.from('local_analyses').insert({
      user_id: user.id,
      zip: zip || null,
      lat: coords.lat,
      lng: coords.lng,
      radius_miles: radius,
      result_json: result,
    });

    setCache(cacheKey, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
