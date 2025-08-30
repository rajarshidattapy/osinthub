// frontend/src/components/ui/hero-section.tsx

"use client";
import { SignInButton, SignedOut } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RainbowButton } from '@/components/ui/gradient-button';

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0D1117]">
      {/* Background Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(47, 129, 247, 0.15), transparent 70%), #0D1117",
        }}
      />

      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-blue-500/[0.15]"
          className="left-[-10%] top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-gray-500/[0.1]"
          className="right-[-5%] top-[70%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                Collaborative Investigations,
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white/90 to-blue-300">
                Made Clear.
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            

            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 leading-relaxed tracking-wide max-w-2xl mx-auto">
              OSINT Hub transforms overwhelming investigative data into clear,
              traceable insights. Collaborate securely, validate with AI, and
              build knowledge together.
            </p>
            <SignedOut>
              <SignInButton mode="modal">
                <RainbowButton variant="variant">Start a Case</RainbowButton>
              </SignInButton>
            </SignedOut>
          </motion.div>

          {/* CTA Button will be added here via SignedOut/SignInButton */}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-[#0D1117]/50 pointer-events-none" />
    </div>
  );
}
