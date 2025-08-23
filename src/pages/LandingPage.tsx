// frontend/src/pages/LandingPage.tsx
import { LandingNavbar } from '@/components/Layout/LandingNavbar';
import { HeroSection } from '@/components/ui/hero-section';
import { SignInButton, SignedOut } from '@clerk/clerk-react';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0D1117] text-gray-200">
            <LandingNavbar />
            <main>
                <div className="relative">
                    <HeroSection />
                    {/* We position the Sign In button within the Hero for signed-out users */}
                    <div className="absolute bottom-[20vh] left-1/2 -translate-x-1/2 z-20">
                         <SignedOut>
                            <SignInButton mode="modal">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors animate-fade-in">
                                    Start Your First Investigation
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </main>
        </div>
    );
}