interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

export function validateEnvironment(): EnvironmentConfig {
  const requiredEnvVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new EnvironmentError(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  return {
    supabaseUrl: requiredEnvVars.VITE_SUPABASE_URL,
    supabaseAnonKey: requiredEnvVars.VITE_SUPABASE_ANON_KEY,
  };
}

export function getEnvironment(): EnvironmentConfig {
  return validateEnvironment();
}
