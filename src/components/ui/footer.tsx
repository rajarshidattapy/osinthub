// frontend/src/components/ui/footer-section.tsx

import { Github, MessageSquare, ArrowRight, GitFork } from "lucide-react";
import { SignInButton, SignedOut } from "@clerk/clerk-react";

const footerLinks = {
  Platform: [
    { name: "Features", href: "#features" },
    { name: "Use Cases", href: "#use-cases" },
    { name: "Security", href: "#" },
  ],
  Resources: [
    { name: "Documentation", href: "#" },
    { name: "Community Forum", href: "#" },
    { name: "Blog", href: "#" },
  ],
  Company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Brand", href: "#" },
  ],
};

const collaborationLinks = [
  { name: "Contribute on GitHub", icon: Github, url: "#" }, // Replace with your GitHub URL
  { name: "Report Issues", icon: MessageSquare, url: "#" }, // Replace with your issues URL
];


export function FooterSection() {
  return (
    <footer className="relative w-full bg-gradient-to-t from-[#0D1117] via-[#0D1117] to-blue-900/20 overflow-hidden pt-24">
      <div className="relative z-10 container mx-auto px-4">
        {/* CTA Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <GitFork className="w-8 h-8 text-white" />
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center mx-auto">
                    Get Started for Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-4 bg-blue-500 rounded-sm"></div>
                <h4 className="text-sm font-medium tracking-wider text-white uppercase">{title}</h4>
              </div>
              <ul className="space-y-3">
               {links.map((link) => (
                    <li key={link.name}>
                        <a href={link.href} className="text-white/60 hover:text-white transition-colors text-sm">
                            {link.name}
                        </a>
                    </li>
                ))}
              </ul>
            </div>
          ))}
           {/* Placeholder for the 4th column to balance the layout */}
           <div></div>
        </div>

        {/* Open Source Collaboration */}
        <div className="text-center mb-16 pt-10 border-t border-white/10">
            <h4 className="text-lg font-semibold text-white mb-2">Open for Collaboration</h4>
            <p className="text-sm text-white/60 mb-4">
              OSINT Hub is open source. Join our community and help us build the future of collaborative intelligence.
            </p>
            <div className="flex justify-center items-center gap-4">
              {collaborationLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200 text-sm text-white/80 hover:text-white"
                  >
                    <IconComponent className="w-4 h-4" />
                    {link.name}
                  </a>
                );
              })}
            </div>
        </div>

        {/* Footer bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 py-8 border-t border-white/10 text-sm text-white/60">
            <p>© {new Date().getFullYear()} OSINT Hub. All Rights Reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
        </div>
      </div>
    </footer>
  );
}