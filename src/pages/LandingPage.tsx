// frontend/src/pages/LandingPage.tsx

import { LandingNavbar } from '@/components/ui/navbar';
import { HeroSection } from '@/components/ui/hero-section';
import { SignInButton, SignedOut } from '@clerk/clerk-react';
import { ProductShowcaseSection } from '@/components/ui/product-showcase-section';
import { FeaturesSection } from '@/components/ui/feature-section';
import {UseCasesSection, useCUseCasesSectionase} from '@/components/ui/use-case';
export function LandingPage() {
    return (
        <div className="bg-[#0D1117]"> 
            <LandingNavbar />
            <main>
                {/* --- HERO SECTION --- */}
                <div className="relative bg-[#0D1117] text-gray-200">
                    <HeroSection />
                    <div className="absolute bottom-[20vh] left-1/2 -translate-x-1/2 z-20">
                         <SignedOut>
                            <SignInButton mode="modal">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors animate-fade-in shadow-lg shadow-blue-500/20">
                                    Get Started
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
                <ProductShowcaseSection />
                 <FeaturesSection />
                <UseCasesSection/>
            </main>
        </div>
    );
}