// frontend/src/components/ui/use-cases-section.tsx

import { useState, useEffect } from 'react';
import { ChevronRight, Shield} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Our defined Use Cases for OSINT Hub
const useCases = [
    {
      id: 1,
      
      title: "For Cybersecurity Analysts",
      description: "Map adversary infrastructure, catalog indicators of compromise (IoCs), and collaborate on threat intelligence in a secure, version-controlled environment with a complete audit trail.",
      image: "/Dashboard.png"
    },
    {
      id: 2,
     
      title: "For Investigative Journalists",
      description: "Collaboratively build case files, verify sources, and maintain the integrity of your evidence. Our AI validation feature helps ensure the accuracy and relevance of contributed information.",
      image: "/Dashboard.png"
    },
    {
      id: 3,
     
      title: "For Corporate Security",
      description: "Conduct internal investigations, perform due diligence, and monitor brand risks with a structured workflow. Role-based access ensures sensitive data is handled with appropriate discretion.",
      image: "/Dashboard.png"
    }
];

export function UseCasesSection() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 80); // 8-second cycle per feature

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setCurrentFeature((prev) => (prev + 1) % useCases.length);
        setProgress(0);
      }, 300);
    }
  }, [progress, useCases.length]);

  const handleFeatureClick = (index) => {
    setCurrentFeature(index);
    setProgress(0);
  };

  return (
    <section className="bg-[#0D1117] py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Built for the Modern Intelligence Professional
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            OSINT Hub is designed to meet the specific needs of analysts, journalists, and security teams who require rigor and collaboration.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 items-stretch rounded-2xl border border-gray-800 overflow-hidden">
  {/* Left Side - Navigation Tabs */}
  <div className="lg:col-span-4 border-r border-gray-800 bg-[#0D1117]">
  <div className="space-y-3 p-4">
    {useCases.map((feature, index) => {
      const isActive = currentFeature === index;

      return (
        <div
          key={feature.id}
          className={`relative flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300 ${
            isActive
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-300 hover:bg-[#1C2128]"
          }`}
          onClick={() => handleFeatureClick(index)}
        >
          {/* Title only, no icons */}
          <span className="font-medium text-sm">{feature.title}</span>

          {/* Right chevron */}
          <ChevronRight
            size={16}
            className={`${
              isActive
                ? "text-white"
                : "text-gray-500 group-hover:text-gray-300"
            } transition-colors`}
          />

          {/* Progress bar only when active */}
          {isActive && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: `${progress}%`,
                  transition: "width 0.1s linear",
                }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>


  {/* Right Side - Content Display */}
  <div className="lg:col-span-8 p-6 bg-[#0D1117]">
    <AnimatePresence mode="wait">
      <motion.div
        key={currentFeature}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex flex-col lg:flex-row gap-8 items-start h-full"
      >
        {/* Left Half - Title + Description */}
        <div className="lg:w-1/2 flex flex-col justify-start">
          <h3 className="text-2xl font-bold text-white mb-3">
            {useCases[currentFeature].title}
          </h3>
          <p className="text-gray-400 leading-relaxed text-base">
            {useCases[currentFeature].description}
          </p>
        </div>

        {/* Right Half - Image Card */}
        <div className="lg:w-1/2 h-full flex">
          <div className="relative w-full h-[400px] lg:h-[500px] bg-[#161B22] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
            <img
              src={useCases[currentFeature].image}
              alt={useCases[currentFeature].title}
              className="w-full h-full object-cover"
            />

            {/* Fallback placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <span className="text-gray-500 text-sm">
                  Dashboard Preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</div>

      </div>
    </section>
  );
};