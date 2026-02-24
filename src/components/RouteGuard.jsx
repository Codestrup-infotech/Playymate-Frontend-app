"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { isAuthenticated, getAuthToken } from '@/lib/api/client';
import { isOnboardingRoute, resumeOnboarding, isMinor } from '@/lib/api/navigation';
import { userService } from '@/services/user';

/**
 * Route Guard Component
 * Protects routes and handles onboarding flow navigation
 */
export default function RouteGuard({ children, requiredAuth = true, allowOnboarding = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkRouteAccess();
  }, [pathname]);

  const checkRouteAccess = async () => {
    try {
      const token = getAuthToken();
      
      // Route requires authentication
      if (requiredAuth) {
        if (!token) {
          // Not authenticated, redirect to login
          router.push('/login');
          return;
        }

        // Check onboarding status
        const status = await userService.getOnboardingStatus();
        
        // Handle onboarding flow
        if (allowOnboarding && status?.next_required_step) {
          const needsOnboarding = isOnboardingRoute(pathname);
          const isAtCorrectStep = pathname.includes(status.next_required_step.toLowerCase().replace('_', '-'));
          
          // If user is at wrong onboarding step, redirect to correct one
          if (!isAtCorrectStep) {
            await resumeOnboarding(router);
            return;
          }
        }

        // Check minor blocking
        if (status?.profile?.dob && isMinor(status.profile.dob)) {
          const blockedRoutes = [
            '/onboarding/activity-intent',
            '/onboarding/profile-details', 
            '/verification',
          ];
          
          const isBlocked = blockedRoutes.some(r => pathname.startsWith(r));
          if (isBlocked) {
            router.push('/onboarding/parent-consent');
            return;
          }
        }
      }

      // Route doesn't require auth (like login page)
      if (!requiredAuth && token) {
        // Already logged in, redirect to home
        const status = await userService.getOnboardingStatus();
        if (status?.onboarding_state === 'COMPLETED' || status?.onboarding_state === 'ACTIVE') {
          router.push('/');
          return;
        }
        // Resume onboarding
        await resumeOnboarding(router);
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Route guard error:', error);
      // On error, redirect to login
      if (requiredAuth) {
        router.push('/login');
      }
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return children;
}

/**
 * Hook for checking route access programmatically
 */
export const useRouteGuard = () => {
  const router = useRouter();
  
  const checkAuth = () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return false;
    }
    return true;
  };

  const checkOnboarding = async () => {
    try {
      const status = await userService.getOnboardingStatus();
      if (status?.next_required_step) {
        await resumeOnboarding(router);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking onboarding:', error);
      return false;
    }
  };

  const checkMinor = (dob) => {
    if (dob && isMinor(dob)) {
      return true; // User is minor
    }
    return false;
  };

  return {
    checkAuth,
    checkOnboarding,
    checkMinor,
  };
};
