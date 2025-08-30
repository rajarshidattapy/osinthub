// frontend/src/components/ui/testimonials-section.tsx

"use client";
import { motion } from 'framer-motion';

// A small helper component for the floating avatars to keep the code clean
const Avatar = ({ src, alt, className }: { src: string; alt: string; className: string; }) => (
    <motion.img
        src={src}
        alt={alt}
        className={`w-14 h-14 rounded-full border-2 border-white/20 shadow-lg ${className}`}
        style={{ boxShadow: '0 0 15px rgba(47, 129, 247, 0.3)' }} // Blue glow effect
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        viewport={{ once: true }}
    />
);


export function TestimonialsSection() {
    // You can cycle through different testimonials here in the future
    const mainTestimonial = {
        quote: "OSINT Hub has fundamentally changed how our team collaborates on threat intelligence. The version control and AI validation are game-changers for accuracy.",
        name: "A. Kim",
        title: "Lead Threat Analyst, CyberSec Firm",
        avatar: "assets/images.jpeg"
    };

    return (
        <section className="relative flex flex-col items-center justify-center py-24 sm:py-32 bg-[#0D1117] overflow-hidden">
            {/* Background Glow */}
            <div 
                className="absolute -bottom-1/4 left-0 w-full h-1/2 z-0"
                style={{
                    background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(47, 129, 247, 0.1), transparent 80%)",
                }}
            />

            <div className="relative z-10 w-full">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl font-bold text-center text-white mb-2">
                        Trusted by Professionals Worldwide
                    </h2>
                    <p className="text-gray-400 text-center text-lg mb-16">
                        Analysts and journalists rely on OSINT Hub for their most critical investigations.
                    </p>
                </motion.div>

                {/* Background dotted map */}
                <div className="relative w-full max-w-6xl mx-auto">
  <motion.img
    src="/dottMap_inverted.jpg"
    alt="Dotted World Map"
className="w-full h-[300px] sm:h-[400px] lg:h-[600px] object-cover opacity-20 mix-blend-luminosity"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 0.2 }}
    viewport={{ once: true }}
    transition={{ duration: 1, delay: 0.2 }}
  />



                    {/* Avatars positioned relative to map */}
                    <div className="absolute inset-0">
                        <Avatar src="/main-person.jpeg" alt="Person 1" className="absolute top-[20%] left-[15%]" />
                        <Avatar src="/person2.webp" alt="Person 2" className="absolute bottom-[15%] left-[20%] !w-12 !h-12" />
                        <Avatar src="assets/images.jpeg" alt="Person 3" className="absolute top-[15%] right-[20%] !w-12 !h-12" />
                        <Avatar src="assets/testimonial1.jpg" alt="Person 4" className="absolute top-[30%] right-[10%]" />
                        <Avatar src="assets/thumbs-up.jpg" alt="Person 5" className="absolute bottom-[20%] right-[15%] !w-12 !h-12" />
                    </div>

                    {/* Central testimonial */}
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-[90%] sm:w-auto"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <img
                            src={mainTestimonial.avatar}
                            alt={mainTestimonial.name}
                            className="w-24 h-24 rounded-full border-2 border-white/20"
                            style={{ boxShadow: '0 0 25px rgba(47, 129, 247, 0.4)' }}
                        />
                        <div className="mt-4 p-6 max-w-sm text-center bg-[#161B22]/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl shadow-black/30">
                            <p className="text-gray-300 italic">
                                “{mainTestimonial.quote}”
                            </p>
                            <h4 className="mt-4 font-semibold text-white">{mainTestimonial.name}</h4>
                            <p className="text-sm text-blue-300">{mainTestimonial.title}</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

    );
}