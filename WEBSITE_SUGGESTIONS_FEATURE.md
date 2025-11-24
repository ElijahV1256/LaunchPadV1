# Website Suggestions Feature

## Overview
AI-powered suggestion system that allows users to request changes to their website and receive intelligent feedback and recommendations.

## How It Works

### 1. Database Table: `website_suggestions`
- Stores all user suggestions and AI responses
- Tracks suggestion status (pending, implemented, dismissed)
- Linked to specific websites and users
- Full RLS security enabled

### 2. Edge Function: `website-suggestions`
**Endpoint:** `POST /functions/v1/website-suggestions`

**Request:**
```json
{
  "websiteId": "uuid",
  "userMessage": "Make the headline more exciting"
}
```

**Response:**
```json
{
  "suggestion_id": "uuid",
  "response": "I'll make the headline more dynamic and action-oriented...",
  "suggested_changes": {
    "copy_updates": {
      "hero_headline": "Transform Your Business Today"
    },
    "design_updates": {
      "colors": {
        "primary": "#FF6B35"
      }
    }
  },
  "requires_regeneration": true
}
```

### 3. Frontend Integration (WebsiteBuilder.tsx)
- "Make Suggestions" section in Step 2 (Preview Website)
- Users can type natural language requests
- AI analyzes context and provides helpful responses
- Shows if regeneration is needed
- One-click regenerate button

## Features

### User Capabilities
- Request copywriting changes ("Make headline more exciting")
- Request design changes ("Use a more professional color scheme")
- Ask questions ("Why did you choose this layout?")
- Get explanations and alternatives

### AI Capabilities
- Analyzes current website context (content, colors, brand)
- Provides specific, actionable suggestions
- Explains reasoning behind recommendations
- Indicates if preview needs regeneration
- Educational and professional responses

## Example Use Cases

1. **Copywriting Changes**
   - "Make the headline shorter and punchier"
   - "Add more urgency to the CTA"
   - "Simplify the about section"

2. **Design Feedback**
   - "Change to warmer colors"
   - "Make it more professional"
   - "Add more emphasis on pricing"

3. **Questions**
   - "Why did you choose these colors?"
   - "How can I make it stand out more?"
   - "What would make this more trustworthy?"

## UI Flow

1. User generates website preview
2. "Make Suggestions" button appears
3. User clicks to expand suggestion box
4. User types their request
5. AI processes and responds with feedback
6. If changes are needed, user can regenerate
7. Suggestion is saved to database for tracking

## Security
- RLS policies ensure users only see their own suggestions
- JWT authentication required
- Input validation on both frontend and backend
- Secure database foreign key constraints

## Benefits
- Empowers users to customize their websites
- Provides professional design/copywriting advice
- Reduces support burden with AI guidance
- Creates conversation-like improvement flow
- Tracks all feedback for future improvements
