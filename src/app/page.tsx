// Root marketing / landing page for anonymous users
"use client";

import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

// Landing sections (ensure all exports exist – some original names differed from spec)
import { LandingNavbar } from '@/components/ui/navbar';
import { HeroSection } from '@/components/ui/hero-section';
import { ProductShowcaseSection } from '@/components/ui/product-showcase-section';
import { FeaturesSection } from '@/components/ui/feature-section';
import { UseCasesSection } from '@/components/ui/use-case';
import { StatsSection } from '@/components/ui/stats-section';
import { TestimonialsSection } from '@/components/ui/testimonials';
import { FooterSection } from '@/components/ui/footer';

// NOTE about requested imports in task description:
// The brief mentioned ProcessSection & separate naming (e.g. footer-section.tsx) which
// do not exist exactly in the codebase. We mapped them to existing components:
//  - ProcessSection -> FeaturesSection (core platform value explanation)
//  - UseCasesSection already present in use-case.tsx
//  - FooterSection exported from footer.tsx
// This keeps implementation consistent without creating duplicate files.

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  // Redirect only the first time after a successful sign-in during this tab session.
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      const alreadyRedirected = sessionStorage.getItem('redirectedAfterSignIn');
      if (!alreadyRedirected) {
        sessionStorage.setItem('redirectedAfterSignIn', 'true');
        navigate('/dashboard');
      } else {
        // User intentionally navigated back to landing; don't force redirect.
        console.debug('[Landing] Signed in user viewing marketing page (redirect suppressed).');
      }
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0D1117]">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <ProductShowcaseSection />
        <FeaturesSection />
        <UseCasesSection />
        <StatsSection />
        <TestimonialsSection />
      </main>
      <FooterSection />
    </div>
  );
}