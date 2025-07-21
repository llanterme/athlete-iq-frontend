# Athlete IQ Frontend - Strava Fitness AI Assistant

## Project Overview

This is the **frontend-only** repository for Athlete IQ, a web application that enables users to chat with an AI assistant about their fitness using personalized insights from their Strava activity data.

**Note:** This is extracted from the main monorepo for simpler deployment to AWS Amplify.

## Tech Stack

### Frontend
- **Framework**: Next.js 15+ with React 19 and TypeScript
- **Styling**: Tailwind CSS 4 with custom glassmorphism design system
- **UI Components**: Radix UI primitives for accessibility
- **Animations**: Framer Motion for smooth interactions
- **State Management**: Zustand for client state, TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js with Strava OAuth provider
- **Charts**: Recharts for fitness data visualization
- **Package Management**: npm

### Integration Points
- **Backend API**: Python FastAPI backend (separate repository)
- **Authentication**: Strava OAuth via NextAuth.js
- **Real-time**: WebSocket integration for chat features

## Project Structure

```
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/auth/           # NextAuth endpoints
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── login/              # Login page
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── chat/               # Chat interface components
│   │   ├── dashboard/          # Dashboard components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Utilities and API clients
│   │   ├── api.ts              # Backend API client
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── strava.ts           # Strava API utilities
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── .env.local                  # Environment variables (local)
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── package.json                # Dependencies and scripts
```

## Features Implemented

### Authentication
- ✅ NextAuth.js with Strava OAuth provider
- ✅ Automatic token refresh
- ✅ Secure session management

### Dashboard
- ✅ Interactive fitness analytics with charts:
  - TSS (Training Stress Score) over time
  - CTL/ATL/TSB (Fitness, Fatigue, Form) trends
  - Sport distribution pie chart
  - Recent activities list with key metrics
- ✅ Responsive design with glassmorphism effects
- ✅ Personal records and threshold estimates

### Chat Interface
- ✅ Real-time conversational AI with typing indicators
- ✅ Smooth animations and transitions
- ✅ Context-aware fitness insights

### Data Visualization
- ✅ Advanced fitness metrics calculations
- ✅ Interactive charts and graphs
- ✅ Training calendar with TSS heatmap

## Environment Variables

Create a `.env.local` file with:

```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000                    # For local dev
NEXTAUTH_SECRET=your-nextauth-secret                  # Generate: openssl rand -base64 32

# Strava OAuth
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000            # Local backend URL
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Deployment

### AWS Amplify (Recommended)

1. **Connect Repository:**
   - Go to AWS Amplify Console
   - Connect this GitHub repository
   - Select main branch

2. **Build Settings:**
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build`
   - Build output directory: `.next`

3. **Environment Variables:**
   - Set all variables from `.env.local`
   - Update `NEXTAUTH_URL` to your Amplify domain
   - Update `NEXT_PUBLIC_API_URL` to your backend URL

4. **Strava OAuth Configuration:**
   - Update Strava app Authorization Callback Domain
   - Add: `your-amplify-domain.com`

### Alternative Deployment Options
- Vercel (optimized for Next.js)
- Netlify
- Docker container

## Backend Integration

This frontend connects to a separate Python FastAPI backend that provides:
- User authentication and session management
- Strava data synchronization and processing
- Vector database integration with Pinecone
- AI-powered fitness insights with OpenAI GPT-4

**Backend Repository:** [Link to backend repo when available]

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React functional component patterns
- Utilize Tailwind CSS for styling
- Implement responsive design (mobile-first)
- Use proper accessibility attributes

### Component Structure
- Keep components small and focused
- Use custom hooks for complex logic
- Implement proper error boundaries
- Follow Next.js App Router patterns

### State Management
- Use Zustand for global client state
- Use React Query for server state
- Keep local state minimal with useState

## Common Issues

### Path Resolution
This project uses standard Next.js path aliases (`@/*` = `src/*`). If you encounter import issues:
- Ensure `tsconfig.json` has proper path mapping
- Verify `next.config.js` webpack aliases if needed

### Authentication Issues
- Verify Strava OAuth redirect URLs match your domain
- Check environment variables are properly set
- Ensure NEXTAUTH_SECRET is generated and consistent

### Build Errors
- Run `npm run type-check` to catch TypeScript issues
- Verify all environment variables are set
- Check for missing dependencies

## Contributing

1. Create feature branch from main
2. Implement changes with proper TypeScript types
3. Test locally with `npm run build`
4. Submit PR with clear description

## License

[Add your license information]

---

**This is the standalone frontend for easier deployment. For the full monorepo with backend, see the main athlete-iq repository.**