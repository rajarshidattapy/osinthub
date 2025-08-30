// frontend/src/pages/LandingPage.tsx

import { LandingNavbar } from '@/components/ui/navbar';
import { HeroSection } from '@/components/ui/hero-section';
import { ProductShowcaseSection } from '@/components/ui/product-showcase-section';
import { FeaturesSection } from '@/components/ui/feature-section';
import {UseCasesSection} from '@/components/ui/use-case';
import {StatsSection} from '@/components/ui/stats-section';
import {TestimonialsSection }from '@/components/ui/testimonials';
import {FooterSection} from '@/components/ui/footer';
export function LandingPage() {
    return (
        <div className="bg-[#0D1117]"> 
            <LandingNavbar />
            <main>
                {/* --- HERO SECTION --- */}
                <div className="relative bg-[#0D1117] text-gray-200">
                    <HeroSection />
                </div>
                <ProductShowcaseSection />
                 <FeaturesSection />
                <UseCasesSection/>
                <StatsSection/>
                <TestimonialsSection/>
                <FooterSection/>
            </main>
        </div>
    );
}