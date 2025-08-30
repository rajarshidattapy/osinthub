// frontend/src/components/ui/testimonials-section.tsx

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Testimonials data
const testimonials = [
  {
    id: 0,
    quote:
      "OSINT Hub has fundamentally changed how our team collaborates on threat intelligence. The version control and AI validation are game-changers for accuracy.",
    name: "A. Kim",
    title: "Lead Threat Analyst, CyberSec Firm",
    avatar: "assets/images.jpeg",
    position: { top: "20%", left: "15%" },
  },
  {
    id: 1,
    quote:
      "The collaborative features make cross-team investigations seamless. We've reduced our research time by 40% since implementing OSINT Hub.",
    name: "Maria Santos",
    title: "Senior Investigative Journalist",
    avatar: "/person2.webp",
    position: { bottom: "15%", left: "20%" },
  },
  {
    id: 2,
    quote:
      "Version control for intelligence data was something we never knew we needed until we had it. Now we can't imagine working without it.",
    name: "Dr. James Chen",
    title: "Research Director, Digital Forensics Lab",
    avatar: "assets/images.jpeg",
    position: { top: "15%", right: "20%" },
  },
  {
    id: 3,
    quote:
      "The AI-powered validation catches errors and duplications that would take us hours to find manually. It's like having an extra analyst on the team.",
    name: "Sarah Mitchell",
    title: "OSINT Specialist, Government Agency",
    avatar: "assets/testimonial1.jpg",
    position: { top: "30%", right: "10%" },
  },
  {
    id: 4,
    quote:
      "OSINT Hub's security features give us the confidence to handle sensitive investigations. The role-based access is perfectly implemented.",
    name: "Alex Rodriguez",
    title: "Security Consultant, Fortune 500",
    avatar: "assets/thumbs-up.jpg",
    position: { bottom: "20%", right: "15%" },
  },
];



// Interactive Avatar component
const InteractiveAvatar = ({
  testimonial,
  isSelected,
  onClick,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) => {
  const sizeClass =
    index === 1 || index === 2 || index === 4 ? "!w-12 !h-12" : "w-14 h-14";

  return (
    <motion.img
      src={testimonial.avatar}
      alt={testimonial.name}
      className={`relative z-10 ${sizeClass} rounded-full border-2 cursor-pointer transition-all duration-300 ${
        isSelected
          ? "border-blue-400"
          : "border-white/20 hover:border-blue-300"
      }`}
      style={{
        boxShadow: isSelected
          ? "0 0 25px rgba(59, 130, 246, 0.5)"
          : "0 0 15px rgba(59, 130, 246, 0.2)",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", delay: index * 0.1 }}
      viewport={{ once: true }}
      onClick={onClick}
      whileHover={{ scale: isSelected ? 1 : 1.1 }}
      whileTap={{ scale: 0.95 }}
    />
  );
};


export function TestimonialsSection() {
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<number | null>(null);

  return (
    <section className="relative flex flex-col items-center justify-center py-24 sm:py-32 bg-[#0D1117] overflow-hidden">
      {/* Consistent Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(47, 129, 247, 0.1), transparent 80%)",
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
            Analysts and journalists rely on OSINT Hub for their most critical
            investigations.
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

          {/* Interactive Avatars + Local Testimonial Cards */}
          <div className="absolute inset-0">
            {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="absolute"
                  style={testimonial.position}
                  onMouseEnter={() => setSelectedTestimonialId(testimonial.id)}
                  onMouseLeave={() => setSelectedTestimonialId(null)}
                >
                  <InteractiveAvatar
                    testimonial={testimonial}
                    isSelected={selectedTestimonialId === testimonial.id}
                    onClick={() => {}} // Click can be used for mobile tap in the future
                    index={index}
                  />

                  <AnimatePresence>
                    {selectedTestimonialId === testimonial.id && (
                        <motion.div
                        className="absolute w-[250px] sm:w-[300px] bg-[#161B22]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/30 z-20"
                        style={{
                            ...(testimonial.position.top ? { top: '120%' } : { bottom: '120%' }),
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                        <p className="text-gray-300 italic text-sm">
                            "{testimonial.quote}"
                        </p>
                        <h4 className="mt-3 font-semibold text-white text-sm">
                            {testimonial.name}
                        </h4>
                        <p className="text-xs text-blue-300">{testimonial.title}</p>
                        
                        <div 
                            className="absolute w-0 h-0"
                            style={{
                            ...(testimonial.position.top ? {
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderBottom: '8px solid rgba(22, 27, 34, 0.9)',
                            } : {
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: '8px solid rgba(22, 27, 34, 0.9)',
                            })
                            }}
                        />
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}