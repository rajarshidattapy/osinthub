// frontend/src/components/ui/stats-section.tsx

import { motion } from 'framer-motion';

// In a real-world scenario, these would be SVG logo components

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
                        Trusted by the Best, 
                    </h2>
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
                        className="md:col-span-3 bg-gradient-to-br from-blue-600/30 to-gray-900/30 border border-white/10 rounded-xl p-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-6xl font-bold text-white">1,000+</p>
                        <p className="mt-2 text-lg text-blue-300">Secure Investigations Launched</p>
                    </motion.div>

                    {/* Supporting Stats */}
                    <motion.div 
                        className="bg-[#161B22] border border-white/10 rounded-xl p-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <p className="text-4xl font-bold text-white">500+</p>
                        <p className="mt-2 text-gray-400">AI-Validated Contributions</p>
                    </motion.div>
                    <motion.div 
                        className="bg-[#161B22] border border-white/10 rounded-xl p-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <p className="text-4xl font-bold text-white">90%</p>
                        <p className="mt-2 text-gray-400">Uptime & Reliability</p>
                    </motion.div>
                    <motion.div 
                        className="bg-[#161B22] border border-white/10 rounded-xl p-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <p className="text-4xl font-bold text-white">100+</p>
                        <p className="mt-2 text-gray-400">Cases Approved</p>
                    </motion.div>
                </div>

                {/* Logo Cloud */}
                
            </div>
        </section>
    );
}