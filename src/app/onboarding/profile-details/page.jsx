"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, User, Briefcase, GraduationCap, Crown, Laptop, Users } from 'lucide-react';
import { userService } from '@/services/user';
import { getErrorMessage } from '@/lib/api/errorMap';
import { navigateToStep } from '@/lib/api/navigation';

const ROLE_TYPES = [
  { 
    id: 'student', 
    label: 'Student', 
    icon: GraduationCap,
    description: 'Currently studying'
  },
  { 
    id: 'working_professional', 
    label: 'Working Professional', 
    icon: Briefcase,
    description: 'Employed full-time or part-time'
  },
  { 
    id: 'business_owner', 
    label: 'Business Owner', 
    icon: Crown,
    description: 'Running my own business'
  },
  { 
    id: 'freelancer', 
    label: 'Freelancer', 
    icon: Laptop,
    description: 'Working independently'
  },
  { 
    id: 'self_employed', 
    label: 'Self Employed', 
    icon: User,
    description: 'Self-employed professional'
  },
  { 
    id: 'other', 
    label: 'Other', 
    icon: Users,
    description: 'Something else'
  },
];

export default function OnboardingProfileDetailsPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select your role');
      return;
    }

    try {
      setLoading(true);
      clearError();

      // Navigate to the existing verification page based on role
      // The existing pages handle the actual form submission
      const roleRoutes = {
        student: '/personal-verifiction/profile_setup/student',
        working_professional: '/personal-verifiction/profile_setup/working_professional',
        business_owner: '/personal-verifiction/profile_setup/business_owner',
        freelancer: '/personal-verifiction/profile_setup/freelancer',
        self_employed: '/personal-verifiction/profile_setup/self_employed',
        other: '/personal-verifiction/profile_setup/other',
      };

      const route = roleRoutes[selectedRole] || '/personal-verifiction/profile_setup/student';
      router.push(route);
    } catch (err) {
      const errorCode = err.response?.data?.error_code;
      const message = getErrorMessage(errorCode) || 'Failed to save role. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/onboarding/activity-intent')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[80%]" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-Playfair Display font-bold">
              What's your
              <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
                role
              </span>
              ?
            </h1>
            <p className="mt-2 text-gray-400 text-sm">
              This helps us personalize your experience
            </p>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Options */}
          <div className="space-y-3">
            {ROLE_TYPES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    clearError();
                  }}
                  disabled={loading}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4
                    ${selectedRole === role.id 
                      ? 'border-pink-500 bg-pink-500/20' 
                      : 'border-white/10 hover:border-pink-500/50 bg-white/5'
                    }
                    disabled:opacity-50
                  `}
                >
                  <div className={`
                    p-2 rounded-lg 
                    ${selectedRole === role.id ? 'bg-pink-500' : 'bg-white/10'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{role.label}</p>
                    <p className="text-xs text-gray-400">{role.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedRole}
            className="w-full py-4 rounded-full font-Poppins font-semibold
                     bg-gradient-to-r from-pink-500 to-orange-400 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
