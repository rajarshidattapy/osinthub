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

// Your defined features for OSINT Hub
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

          {/* New Features Grid with Hover Effects */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
            {features.map((feature, index) => (
              <Feature key={feature.title} {...feature} index={index} />
            ))}
          </div>
      </div>
    </section>
  );
}

// The Feature sub-component with the new styling
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
}) => {
  return (
   <div
  className={cn(
    "flex flex-col py-10 relative group/feature border-neutral-800 items-center text-center", 
    // Adapted border logic for a 3-column grid
    "border-t",
    (index % 3 === 0) && "lg:border-l",
    (index % 3 !== 2) && "lg:border-r"
  )}
>
  {/* Top row hover effect */}
  {index < 3 && (
    <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
  )}
  
  {/* Bottom row hover effect */}
  {index >= 3 && (
    <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-800 to-transparent pointer-events-none" />
  )}

  {/* Content wrapper */}
  <div className="flex flex-col items-center text-center relative z-10">
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