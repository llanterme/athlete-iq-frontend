'use client';

import { signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';

// Modern icon components (can be replaced with react-icons if preferred)
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Race: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Training: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Profile: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Lightning: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
};

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
    });
  };

  const navigationItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      icon: Icons.Dashboard,
      description: 'Analytics & Overview'
    },
    { 
      label: 'Race Calendar', 
      href: '/races', 
      icon: Icons.Race,
      description: 'Goals & Events'
    },
    { 
      label: 'Training Plans', 
      href: '/training-plan', 
      icon: Icons.Training,
      description: 'AI-Generated Plans'
    },
    { 
      label: 'Profile', 
      href: '/profile', 
      icon: Icons.Profile,
      description: 'Settings & Stats'
    },
  ];

  return (
    <nav className="relative">
      {/* Main navigation bar */}
      <div className="bg-gradient-to-r from-fitness-navy-900/95 via-fitness-navy-800/95 to-fitness-navy-900/95 backdrop-blur-md border-b border-fitness-navy-600/30 shadow-fitness">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and brand */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-3 group"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-fitness-orange-400 to-fitness-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Icons.Lightning />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-fitness-orange-400 to-fitness-orange-600 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-200 blur-sm" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white via-fitness-orange-200 to-white bg-clip-text text-transparent">
                    Athlete IQ
                  </h1>
                  <p className="text-xs text-fitness-navy-400 font-medium">
                    AI Performance Coach
                  </p>
                </div>
              </button>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const IconComponent = item.icon;
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={clsx(
                        'nav-item group relative flex items-center space-x-2',
                        'px-4 py-2 rounded-xl font-medium transition-all duration-200',
                        isActive 
                          ? 'nav-item-active text-white bg-gradient-to-r from-fitness-orange-500/20 to-fitness-blue-500/20 border border-fitness-orange-500/40'
                          : 'text-fitness-navy-200 hover:text-white'
                      )}
                    >
                      <IconComponent />
                      <span className="text-sm">{item.label}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-fitness-orange-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Strava branding */}
            <div className="hidden md:flex items-center">
              <img
                src="/api_logo_pwrdBy_strava_horiz_orange.png"
                alt="Powered by Strava"
                className="h-5 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Mobile menu */}
              <div className="lg:hidden">
                <select
                  value={pathname}
                  onChange={(e) => router.push(e.target.value)}
                  className="form-input text-sm py-2 pr-8 min-w-[140px]"
                >
                  {navigationItems.map((item) => (
                    <option 
                      key={item.href} 
                      value={item.href} 
                      className="bg-fitness-navy-800 text-white"
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Logout button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                icon={<Icons.Logout />}
                className="hidden sm:flex"
              >
                Logout
              </Button>
              
              {/* Mobile logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="sm:hidden p-2"
              >
                <Icons.Logout />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Secondary navigation info bar */}
      <div className="bg-gradient-to-r from-fitness-navy-900/50 to-fitness-navy-800/50 border-b border-fitness-navy-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center justify-center py-2">
            <div className="flex items-center space-x-6 text-xs">
              {navigationItems.map((item) => {
                if (pathname === item.href) {
                  return (
                    <div key={item.href} className="flex items-center space-x-2 text-fitness-orange-400">
                      <div className="w-1 h-1 bg-fitness-orange-400 rounded-full" />
                      <span className="font-medium">{item.description}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}