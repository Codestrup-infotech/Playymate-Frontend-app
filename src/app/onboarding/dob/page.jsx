

"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { userService } from '@/services/user';
import { getErrorMessage } from '@/lib/api/errorMap';
import { getRouteFromStep } from '@/lib/api/navigation';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 7;

function DrumPicker({ items, selectedIndex, onIndexChange, formatLabel }) {
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startIndex = useRef(0);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY ?? e.touches?.[0]?.clientY;
    startIndex.current = selectedIndex;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const delta = startY.current - clientY;
    const indexDelta = Math.round(delta / ITEM_HEIGHT);
    const newIndex = clamp(startIndex.current + indexDelta, 0, items.length - 1);
    onIndexChange(newIndex);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    onIndexChange(clamp(selectedIndex + delta, 0, items.length - 1));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  });

  const visibleRange = 3; // items above/below center

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-grab active:cursor-grabbing overflow-hidden"
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Fade top */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: ITEM_HEIGHT * 3,
          background: 'linear-gradient(to bottom, #111113 0%, transparent 100%)',
        }}
      />
      {/* Fade bottom */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: ITEM_HEIGHT * 3,
          background: 'linear-gradient(to top, #111113 0%, transparent 100%)',
        }}
      />
      {/* Center highlight bar */}
      <div
        className="absolute inset-x-0 z-20 pointer-events-none"
        style={{
          top: ITEM_HEIGHT * 3,
          height: ITEM_HEIGHT,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      />

      {/* Items */}
      <div
        style={{
          transform: `translateY(${(3 - selectedIndex) * ITEM_HEIGHT}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {items.map((item, idx) => {
          const distance = Math.abs(idx - selectedIndex);
          const isSelected = idx === selectedIndex;
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.35 : 0.15;
          const scale = distance === 0 ? 1 : distance === 1 ? 0.88 : 0.76;

          return (
            <div
              key={idx}
              onClick={() => onIndexChange(idx)}
              style={{
                height: ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity,
                transform: `scale(${scale})`,
                transition: 'opacity 0.15s, transform 0.15s',
                cursor: 'pointer',
                fontSize: isSelected ? '1.5rem' : '1rem',
                fontWeight: isSelected ? '700' : '400',
                color: isSelected
                  ? 'transparent'
                  : '#fff',
                background: isSelected
                  ? 'linear-gradient(90deg, #e8506a, #e8923a)'
                  : 'transparent',
                WebkitBackgroundClip: isSelected ? 'text' : 'unset',
                WebkitTextFillColor: isSelected ? 'transparent' : '#fff',
                letterSpacing: isSelected ? '0.01em' : '0',
              }}
            >
              {formatLabel ? formatLabel(item) : item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingDOBPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [age, setAge] = useState(null);

  const currentYear = new Date().getFullYear();

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const months = useMemo(() => [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ], []);
  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear - 13; y >= currentYear - 100; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const [dayIndex, setDayIndex] = useState(6);      // default day=7
  const [monthIndex, setMonthIndex] = useState(1);  // default Feb
  const [yearIndex, setYearIndex] = useState(21);   // default ~2002

  const selectedDay = days[dayIndex];
  const selectedMonth = monthIndex + 1; // 1-based
  const selectedYear = years[yearIndex];

  const clearError = () => setError(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await userService.getOnboardingStatus();
        const state = response?.data?.data?.onboarding_state;
        
        console.log('DOB page - State:', state);

        // If state is already past DOB, redirect to location
        const pastDOBStates = ['PARENT_CONSENT_PENDING', 'PARENT_CONSENT_APPROVED', 'LOCATION_CAPTURED', 'PROFILE_PHOTO_CAPTURED'];
        if (pastDOBStates.includes(state)) {
          router.push('/onboarding/location');
          return;
        }

        // If state is DOB_CAPTURED or GENDER_CAPTURED (user just came from gender), stay on this page
        if (state === 'DOB_CAPTURED' || state === 'GENDER_CAPTURED') {
          setInitialLoading(false);
          return;
        }

        // For any other state (including null, undefined), redirect to gender
        router.push('/onboarding/gender');
      } catch (err) {
        console.error('Failed to check onboarding status:', err);
        // On error, redirect to gender
        router.push('/onboarding/gender');
      } finally {
        setInitialLoading(false);
      }
    };
    checkOnboardingStatus();
  }, [router]);

  const computeAge = () => {
    const birthDate = new Date(`${selectedYear}-${String(selectedMonth).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`);
    const today = new Date();
    let a = today.getFullYear() - birthDate.getFullYear();
    const md = today.getMonth() - birthDate.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birthDate.getDate())) a--;
    return a;
  };

  const handleContinuePress = () => {
    clearError();
    const a = computeAge();
    if (a < 13) { setError('You must be at least 13 years old to use this app'); return; }
    if (a > 100) { setError('Please enter a valid date of birth'); return; }
    setAge(a);
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    const dob = `${selectedYear}-${String(selectedMonth).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
    try {
      setLoading(true);
      clearError();

      const response = await userService.updateDOB(dob);
      console.log('DOB response:', response.data);

      const responseData = response?.data;
      const data = responseData?.data;
      const ageGroup = data?.age_group;
      const isAdult = ageGroup === '18_plus' || ageGroup === 'ADULT';
      const isMinor = ageGroup === '13_17' || ageGroup === '16_17' || ageGroup === 'UNDER_18';

      console.log('Age group:', ageGroup, 'Is adult:', isAdult, 'Is minor:', isMinor);

      // For minors (< 18), always require parent consent first
      if (isMinor) {
        console.log('User is a minor - redirecting to parent consent');
        router.push('/onboarding/parent-consent');
        return;
      }

      // For adults (18+), check for next_required_step from API response
      const nextStep = responseData?.next_required_step;
      console.log('Next step from API:', nextStep);
      
      // Check if nextStep is a valid string (not empty object, not empty string)
      const isValidNextStep = nextStep && typeof nextStep === 'string' && nextStep.trim() !== '';
      
      if (isValidNextStep) {
        // If API returns a valid step string, use it for adults
        if (nextStep === 'PARENT_CONSENT') {
          router.push('/onboarding/parent-consent');
          return;
        } else if (nextStep === 'LOCATION') {
          router.push('/onboarding/location');
          return;
        } else if (nextStep === 'PROFILE_PHOTO') {
          router.push('/onboarding/photo');
          return;
        } else {
          // For any other step from API
          const route = getRouteFromStep(nextStep);
          if (route) {
            router.push(route);
            return;
          }
        }
      }

      // Default for adults: go to location
      console.log('Navigating to location (adult)');
      router.push('/onboarding/location');
    } catch (err) {
      console.error('DOB save error:', err);
      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message;
      
      // Handle state mismatch errors
      if (status === 400) {
        const nextStep = err.response?.data?.next_required_step;
        if (nextStep) {
          const route = getRouteFromStep(nextStep);
          router.push(route);
          return;
        }
      }
      
      const message = getErrorMessage(errorCode) || errorMsg || 'Failed to save date of birth. Please try again.';
      setError(message);
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => router.push('/onboarding/location');

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111113' }}>
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const monthLabel = months[monthIndex];
  const confirmLabel = `${monthLabel} ${selectedDay}, ${selectedYear}`;

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-start px-6 pt-10"
      style={{ backgroundColor: '#111113' }}
    >
      <div className="w-full max-w-sm flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/onboarding/gender')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[30%]" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            How{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Old</span>{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #e8506a, #c0392b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              Are You
            </span>
          </h1>
          <p className="mt-1 text-gray-400 text-sm">Please Provide your age in Years</p>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2 mb-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drum Pickers */}
        <div className="flex-1 flex items-center">
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #1c1c1f, #151518)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="grid grid-cols-3">
              {/* Day */}
              <DrumPicker
                items={days}
                selectedIndex={dayIndex}
                onIndexChange={setDayIndex}
                formatLabel={(d) => String(d).padStart(2, '0')}
              />
              {/* Month */}
              <DrumPicker
                items={months}
                selectedIndex={monthIndex}
                onIndexChange={setMonthIndex}
              />
              {/* Year */}
              <DrumPicker
                items={years}
                selectedIndex={yearIndex}
                onIndexChange={setYearIndex}
              />
            </div>
          </div>
        </div>

        {/* Confirm Sheet */}
        {showConfirm ? (
          <div
            className="mt-6 rounded-2xl p-5 text-center"
            style={{
              background: 'linear-gradient(160deg, #1e1e22, #18181c)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-white font-bold text-lg mb-1">You're {age}</p>
            <p className="text-gray-400 text-sm mb-4">
              Is {confirmLabel} your birthday? This can only be changed once.
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #e8506a, #e8923a)' }}
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : 'Continue'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="mt-3 text-gray-400 text-sm hover:text-white transition-colors w-full py-2"
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <button
              onClick={handleContinuePress}
              disabled={loading}
              className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #e8506a, #e8923a)' }}
            >
              Continue
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
