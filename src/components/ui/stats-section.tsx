// frontend/src/components/ui/stats-section.tsx

import { motion } from 'framer-motion';
import { BorderBeam } from "@/components/magicui/border-beam";

export function StatsSection() {
    return (
        <section className="relative bg-[#0D1117] py-24 sm:py-32">
            {/* Background Glow */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    background: "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(47, 129, 247, 0.15), transparent 80%)",
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        Proven by the Numbers
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                        Our platform is designed for high-stakes environments where accuracy and security are paramount.
                    </p>
                </div>

                {/* Statistics Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Stat Card */}
                    <motion.div
                        className="md:col-span-3 relative border border-white/10 rounded-xl p-8 text-center overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(4, 4, 99, 1) 35%, rgba(5, 170, 179, 1) 54%, rgba(2, 232, 98, 1) 78%, rgba(0, 212, 255, 1) 89%)",
                        }}
                    >
                        {/* Optional radial glow overlay */}
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(47, 129, 247, 0.15), transparent 80%)",
                            }}
                        />

                        {/* Content */}
                        <div className="relative z-10">
                            <p className="text-6xl font-bold text-white">1,000+</p>
                            <p className="mt-2 text-lg text-white">Secure Investigations Launched</p>
                        </div>
                    </motion.div>

                    {/* Supporting Stats */}
                    <motion.div 
                        className="relative bg-[#161B22] border border-white/10 rounded-xl p-8 text-center overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <p className="text-4xl font-bold text-white relative z-10">500+</p>
                        <p className="mt-2 text-gray-400 relative z-10">AI-Validated Contributions</p>
                        
                        <BorderBeam
                            duration={6}
                            size={23}
                            borderWidth={1}
                            colorFrom="#3b82f6"
                            colorTo="#1e40af"
                            className="from-blue-500 via-blue-400 to-blue-500"
                        />
                    </motion.div>

                    <motion.div 
                        className="relative bg-[#161B22] border border-white/10 rounded-xl p-8 text-center overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <p className="text-4xl font-bold text-white relative z-10">90%</p>
                        <p className="mt-2 text-gray-400 relative z-10">Uptime & Reliability</p>
                        
                        <BorderBeam
                            duration={6}
                            delay={2}
                            size={23}
                            borderWidth={1}
                            colorFrom="#06b6d4"
                            colorTo="#0891b2"
                            className="from-cyan-500 via-cyan-400 to-cyan-500"
                        />
                    </motion.div>

                    <motion.div 
                        className="relative bg-[#161B22] border border-white/10 rounded-xl p-8 text-center overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <p className="text-4xl font-bold text-white relative z-10">100+</p>
                        <p className="mt-2 text-gray-400 relative z-10">Cases Approved</p>
                        
                        <BorderBeam
                            duration={6}
                            delay={4}
                            size={23}
                            borderWidth={1}
                            colorFrom="#10b981"
                            colorTo="#059669"
                            className="from-green-500 via-green-400 to-green-500"
                        />
                    </motion.div>
                </div>  
            </div>
        </section>
    );
}