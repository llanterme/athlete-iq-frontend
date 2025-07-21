# Athlete IQ Frontend

A modern Next.js frontend application for the Athlete IQ Strava Fitness AI Assistant.

## 🚀 Features

- **Next.js 15** with React 19 and TypeScript
- **Strava OAuth Authentication** with NextAuth.js
- **Responsive Design** with Tailwind CSS
- **Persistent Sessions** across page refreshes
- **Automatic Token Refresh** for expired Strava tokens
- **Modern UI Components** with glassmorphism design

## 🛠️ Setup

### 1. Install Dependencies

```bash
make install
# or
npm install
```

### 2. Configure Environment Variables

The `.env.local` file should contain:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
```

### 3. Run Development Server

```bash
make dev
# or
npm run dev
```

The app will be available at http://localhost:3000

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # UI primitives
│   └── dashboard/       # Dashboard components
├── lib/                 # Utilities
│   ├── auth.ts          # NextAuth config
│   └── strava.ts        # Strava API client
└── types/               # TypeScript types
    ├── strava.ts        # Strava types
    └── next-auth.d.ts   # NextAuth types
```

## 🎯 Key Features

### Authentication Flow
1. User clicks "Connect with Strava"
2. Redirected to Strava OAuth page
3. After authorization, redirected back to dashboard
4. Session persists across page refreshes
5. Automatic token refresh when needed

### Dashboard Components
- **ProfileHeader**: Displays athlete profile with photo and info
- **StatsGrid**: Shows activity statistics in organized cards
- **ActivityStatsCard**: Individual stat cards for different activities
- **PersonalRecords**: Displays biggest achievements
- **Navigation**: App header with logout functionality

### Session Management
- NextAuth.js handles OAuth flow and session persistence
- Automatic token refresh when Strava tokens expire
- Secure token storage in encrypted JWT tokens
- Session persists across browser tabs and refreshes

## 🎨 UI Design

### Color Scheme
- **Primary**: Strava Orange (#FC4C02)
- **Background**: Gradient from orange to warm tones
- **Cards**: Glassmorphism with backdrop blur
- **Text**: White with various opacity levels

### Components
- **Button**: Multiple variants with loading states
- **Card**: Glassmorphism design with backdrop blur
- **Typography**: Clean, modern font hierarchy

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Development Commands

```bash
# Start development server
make dev

# Build for production
make build

# Start production server
make start

# Run linting
make lint

# Run type checking
make type-check

# Clean build files
make clean
```

## 🚀 Deployment

The frontend is configured for deployment on Vercel or similar platforms:

1. **Environment Variables**: Set up the same env vars in your deployment platform
2. **Build Command**: `npm run build`
3. **Start Command**: `npm run start`
4. **Node Version**: 18.x or higher

## 🧪 Session Persistence

The app implements robust session management:

- **JWT Storage**: Secure token storage in httpOnly cookies
- **Token Refresh**: Automatic refresh before expiration
- **Error Handling**: Graceful fallback to re-authentication
- **Cross-Tab Sync**: Sessions work across browser tabs

## 🔍 API Integration

The frontend communicates with the Strava API through:
- **Direct API calls** for athlete data and stats
- **NextAuth.js callbacks** for token management
- **Error handling** for API failures
- **Loading states** for better UX

## 🎯 Goals Achieved

✅ **New UI Stack**: Modern Next.js with React 19 and TypeScript  
✅ **Strava OAuth**: Seamless authentication flow  
✅ **Session Persistence**: Works across page refreshes  
✅ **Token Handling**: Automatic refresh for expired tokens  
✅ **Responsive Design**: Works on all device sizes  
✅ **Error Handling**: Graceful error states and recovery