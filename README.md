# Launch Pad - AI Business Roadmap Platform

Launch Pad is an AI-powered platform that helps entrepreneurs launch and grow their businesses. It provides comprehensive tools for business ideation, roadmap generation, brand identity creation, website building, marketing strategy, and operational management.

## Features

- **Business Idea Generation**: AI-powered business idea generation based on user preferences
- **Business Roadmaps**: Step-by-step roadmaps with actionable guidance
- **Brand Identity**: Logo creation, color palettes, and brand foundation
- **Website Builder**: AI-generated websites with customizable templates
- **Marketing Tools**: Social posts, flyers, message templates, and ad strategies
- **Operations Management**: Business operations tracking and optimization
- **Local Opportunities**: Find and explore local business opportunities

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **DOMPurify** - HTML sanitization

### Backend & Infrastructure
- **Supabase** - Backend as a Service (authentication, database, storage)
- **Supabase Edge Functions** - Serverless functions (Deno runtime)
- **PostgreSQL** - Database with Row Level Security
- **Anthropic Claude** - AI model for content generation

## Project Structure

```
/src
  /components     # Reusable UI components
  /config         # Configuration files (Supabase client)
  /contexts       # React contexts (Auth, etc.)
  /hooks          # Custom React hooks
  /pages          # Page components (route handlers)
  /services       # API services and business logic
  /utils          # Utility functions and helpers

/supabase
  /functions      # Edge functions
  /migrations     # Database migrations
```

## Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account
- Anthropic API key (for AI features)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd launch-pad
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings.

### 4. Database Setup

The database migrations are located in `/supabase/migrations`. These are automatically applied when you set up Supabase.

Key tables:
- `user_profiles` - Extended user information
- `roadmaps` - Business roadmaps
- `brand_identity` - Brand assets and identity
- `websites` - Generated websites
- `marketing_strategies` - Marketing plans
- `saved_ideas` - Saved business ideas
- `saved_business_names` - Saved business names

### 5. Edge Functions

Edge functions handle AI generation and sensitive operations. They require environment variables to be set in Supabase:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Set this in your Supabase project settings under Edge Functions secrets.

### 6. Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
```

The built files will be in the `/dist` directory.

## Architecture

### Authentication

The app uses Supabase Auth with email/password authentication. The auth flow includes:
- User registration and login
- Session management with automatic token refresh
- Protected routes using `PrivateRoute` component
- User-friendly error messages

### Database Security

All database tables use Row Level Security (RLS) policies to ensure users can only access their own data. Policies are defined in the migration files.

### AI Integration

AI features are handled through Supabase Edge Functions for security:
- API keys are never exposed to the client
- All AI requests go through authenticated edge functions
- Content is sanitized before rendering

### Code Splitting

The app uses React lazy loading to split code by route, reducing initial bundle size and improving performance.

## Key Features Implementation

### Business Idea Generation

Users can generate AI-powered business ideas based on:
- Industry preferences
- Skill level
- Budget constraints
- Location-based opportunities

### Brand Identity

Users can create comprehensive brand identities including:
- AI-generated logos
- Color palettes
- Brand voice and messaging
- Taglines and slogans

### Website Builder

Two tiers of websites:
1. **Starter Websites**: Quick, AI-generated single-page sites
2. **Pro Websites**: Fully managed multi-page websites with advanced features

### Marketing Strategy

AI-generated marketing strategies including:
- Target audience analysis
- Content strategy
- Channel recommendations
- Budget allocation
- 90-day launch plan

## Security Best Practices

1. **No client-side API keys**: All sensitive keys are in edge functions
2. **Input sanitization**: DOMPurify sanitizes all HTML content
3. **Row Level Security**: Database enforces user data isolation
4. **Auth token management**: Automatic refresh with error handling
5. **Environment validation**: Runtime checks for required config

## Performance Optimizations

1. **Code splitting**: Lazy-loaded routes
2. **Image optimization**: Responsive images with proper sizing
3. **Caching**: Supabase client caching
4. **Bundle size**: Removed unused dependencies

## Accessibility

The app includes:
- ARIA labels and roles
- Semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

## Mobile Responsiveness

The app is fully responsive with:
- Mobile-first Tailwind CSS classes
- Viewport meta tags
- Touch-friendly UI elements
- Adaptive layouts

## Contributing

When contributing, please:
1. Follow the existing code style
2. Write TypeScript with proper types (avoid `any`)
3. Add migrations for database changes
4. Test auth flows and edge functions
5. Ensure accessibility standards are met

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Common Issues

### Build Errors

If you encounter build errors:
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check TypeScript errors: `npm run typecheck`

### Authentication Issues

If authentication isn't working:
1. Verify environment variables are set correctly
2. Check Supabase project settings
3. Ensure email confirmation is disabled (or handle it properly)
4. Check browser console for detailed errors

### Edge Function Errors

If edge functions fail:
1. Check Supabase logs in the dashboard
2. Verify ANTHROPIC_API_KEY is set in Supabase
3. Test edge function endpoints directly
4. Check CORS headers are properly set

## License

[Your License]

## Support

For issues and questions, please open an issue on GitHub.
