// frontend/src/components/ui/features-section.tsx

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { 
    FolderGit2, 
    GitFork, 
    Bot, 
    GitCommit, 
    ShieldCheck, 
} from 'lucide-react';
import React from 'react';

const features = [
  {
    title: "Case Repositories",
    description: "Create and manage dedicated repositories to securely store and organize investigation files.",
    icon: <FolderGit2 className="w-8 h-8 text-neutral-400" />,
  }, 
  {
    title: "Collaborative Editing",
    description: "Fork repositories, contribute edits, and submit merge requests to refine intelligence together.",
    icon: <GitFork className="w-8 h-8 text-neutral-400" />,
  },
  {
    title: "AI-Powered Validation",
    description: "Google Gemini reviews proposed changes for accuracy, relevance, and duplication before approval.",
    icon: <Bot className="w-8 h-8 text-neutral-400" />,
  },
  {
    title: "Version Control",
    description: "Track every modification with comprehensive audit trails and transparent history.",
    icon: <GitCommit className="w-8 h-8 text-neutral-400" />,
  },
  {
    title: "Role-Based Access",
    description: "Assign granular permissions to analysts, journalists, and collaborators for secure investigations.",
    icon: <ShieldCheck className="w-8 h-8 text-neutral-400" />,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
          >
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tighter">
                  An All-in-One Intelligence Platform
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-base text-gray-400">
                  Everything you need to conduct, manage, and collaborate on complex investigations in a single, secure environment.
              </p>
          </motion.div>

          {/* Features Grid Container */}
          <div className="mt-16">
            {/* Top Row - 3 cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 border-neutral-800">
              {features.slice(0, 3).map((feature, index) => (
                <Feature 
                  key={feature.title} 
                  {...feature} 
                  index={index}
                  isTopRow={true}
                  totalInRow={3}
                />
              ))}
            </div>
            
            {/* Bottom Row - 2 cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 border-neutral-800 border-t">
              {features.slice(3, 5).map((feature, index) => (
                <Feature 
                  key={feature.title} 
                  {...feature} 
                  index={index}
                  isTopRow={false}
                  totalInRow={2}
                />
              ))}
            </div>
          </div>

      </div>
    </section>
  );
}

// The Feature sub-component with the shadow effect re-integrated
const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  isTopRow: boolean;
  totalInRow: number;
}) => {
  const isNotFirstInRow = index > 0;

  return (
    <div
      className={cn(
        "flex flex-col py-10 relative group/feature items-center text-center border-neutral-800",
        // Left border for all except first in row
        isNotFirstInRow && "lg:border-l"
      )}
    >
        {/* --- THIS IS THE NEW GLOWING SHADOW EFFECT --- */}
        <div 
            className="absolute inset-0 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
                background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 80%)"
            }}
        />

      {/* Content wrapper */}
      <div className="flex flex-col items-center text-center relative z-10 px-6">
        {/* Icon */}
        <div className="mb-4">{icon}</div>

        {/* Title */}
        <div className="text-lg font-bold mb-2">
          <span className="group-hover/feature:text-blue-400 transition duration-200 inline-block text-neutral-100">
            {title}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-300 max-w-xs">
          {description}
        </p>
      </div>
    </div>
  );
};