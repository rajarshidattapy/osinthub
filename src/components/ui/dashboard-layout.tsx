// frontend/src/components/ui/dashboard-preview.tsx

import { motion } from 'framer-motion';
import { Plus, GitFork, Users } from 'lucide-react';

export function DashboardPreview() {
    const fadeIn = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <motion.div 
            className="max-w-5xl mx-auto px-4 -mt-32 relative z-10" // -mt-32 pulls it up into the hero section
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="bg-[#161B22]/80 backdrop-blur-sm rounded-xl shadow-2xl shadow-black/30 border border-white/10 overflow-hidden">
                {/* Header Mock */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-700 rounded-full" />
                        <div className="w-24 h-4 bg-gray-700 rounded" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-8 bg-gray-700 rounded-md" />
                        <div className="w-32 h-8 bg-green-500/20 border border-green-500/50 rounded-md flex items-center justify-center">
                           <Plus className="w-4 h-4 text-green-400 mr-2" />
                           <span className="text-sm text-green-400 font-medium">New</span>
                        </div>
                    </div>
                </div>

                {/* Body Mock */}
                <div className="p-6">
                    <div className="w-64 h-6 bg-gray-700 rounded mb-6" />
                    
                    {/* Repository Item Mock */}
                    <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="w-1/2 h-5 bg-blue-400/50 rounded" />
                            <div className="flex items-center space-x-1 text-gray-400">
                                <GitFork className="w-4 h-4" />
                                <span className="text-sm">3</span>
                            </div>
                        </div>
                        <div className="w-3/4 h-4 bg-gray-700 rounded mt-3" />
                        <div className="flex items-center space-x-4 mt-4">
                            <div className="w-24 h-3 bg-gray-700 rounded" />
                            <div className="flex items-center space-x-1 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">3 collaborators</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}