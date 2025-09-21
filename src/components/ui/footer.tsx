// frontend/src/components/ui/footer-section.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Github, MessageSquare, GitFork } from "lucide-react";
import { SignInButton, SignedOut } from "@clerk/clerk-react";
import { Button } from './gradient-button'; 
import {BorderBeam} from '@/lib/border-beam';
import {SpinningText} from "@/components/magicui/spinning-text";
const footerLinks = {
  Platform: [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#" },
    { name: "Use Cases", href: "#use-cases" },
  ],
  Resources: [
    { name: "Documentation", href: "#" },
    { name: "Community", href: "#" },
    { name: "Blog", href: "#" },
  ],
  Company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Brand Guidelines", href: "#" },
  ],
};

const collaborationLinks = [
  { name: "Contribute on GitHub", icon: Github, url: "#" },
  { name: "Report an Issue", icon: MessageSquare, url: "#" },
];

export function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <footer 
        ref={footerRef}
        className="relative w-full bg-[#0D1117] overflow-hidden pt-24"
        style={{
            '--mouse-x': `${mousePosition.x}px`,
            '--mouse-y': `${mousePosition.y}px`,
        } as React.CSSProperties}
    >
      {/* Interactive Gradient Background */}
      <div 
        className="interactive-footer-gradient absolute inset-0 z-0 transition-opacity duration-500"
        aria-hidden="true"
      />
      {/* Subtle dotted pattern for texture */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)', backgroundSize: '20px 20px' }}
      />


      <div className="relative z-10 container mx-auto px-4">
        {/* CTA Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="flex justify-center mb-6">
            <div className="w-30 h-16 flex items-center justify-center rounded-2xl">
              <img
    src="/ui.png"   // make sure path is correct
    alt="OSINT Hub Logo"
    className="w-20 h-16 drop-shadow-md"
  />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Start Your Secure Investigation Today
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Join the platform built for clarity, collaboration, and trust in intelligence gathering.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
                <Button className="relative overflow-hidden" size="lg" variant="outline">
     Open your first case!!
      <BorderBeam
        size={40}
        initialOffset={20}
        className="from-transparent via-yellow-500 to-transparent"
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 20,
        }}
      />
    </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>

              <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4">{title}</h4>
              <ul className="space-y-3">
                
               {links.map((link) => (
                    <li key={link.name}>
                        <a href={link.href} className="text-white/60 hover:text-white hover:pl-1 transition-all duration-200 text-sm">
                            {link.name}
                        </a>
                    </li>
                ))}
                
              </ul>
              
            </div>

          ))}
           <div><div className="flex flex-col md:flex-row items-center justify-between w-full"></div>

  <div className="flex items-center justify-end mt-4 md:mt-12">
    <SpinningText 
      radius={8} 
      duration={12} 
      className="text-white/70 text-sm"
    >
      Uncover  • Collaborate  • discover  •
    </SpinningText>
  </div>
</div> {/* Placeholder for 4th column */}
        </div>

        {/* Footer bottom row */}
<div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6 py-8 border-t border-white/10 text-sm text-white/60">
  
  {/* Left side spinning text */}
 

  {/* Center copyright */}
  <p className="order-first md:order-none">
    © {new Date().getFullYear()} OSINT Hub. All Rights Reserved.
  </p>

  {/* Right side collaboration links */}
  <div className="flex justify-center items-center gap-4">
    {collaborationLinks.map((link) => {
      const IconComponent = link.icon;
      return (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200 text-sm text-white/80 hover:text-white"
        >
          <IconComponent className="w-4 h-4" />
          <span>{link.name}</span>
        </a>
      );
    })}
  </div>
</div>

      </div>
    </footer>
  );
}