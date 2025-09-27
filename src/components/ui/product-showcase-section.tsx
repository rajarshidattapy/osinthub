// frontend/src/components/ui/product-showcase-section.tsx

import { motion } from 'framer-motion';

export function ProductShowcaseSection() {
    const fadeIn = {
        hidden: { opacity: 0, y: 60, scale: 0.9 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <section className="relative z-10 -mt-48"> {/* Negative margin pulls it up into the Hero */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="relative group">
                         {/* Subtle glow effect behind the image */}
                        <div 
                            className="absolute -inset-2 bg-blue-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            aria-hidden="true"
                        />
                        
                        {/* The image container with glassmorphism styling */}
                        <div className="bg-gray-900/50 backdrop-blur-xl p-2 sm:p-3 border border-white/10 rounded-xl shadow-2xl shadow-black/40">
                            <img 
                                src="/dashboard.png" 
                                alt="OSINT Hub Dashboard" 
                                className="w-full h-auto rounded-lg"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}