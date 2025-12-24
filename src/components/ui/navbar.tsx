"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, Github } from "lucide-react"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Docs", href: "/docs" },
  { name: "Community", href: "https://github.com/rajarshidattapy/osinthub", external: true },
]

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="flex justify-center w-full pt-6 px-4">
        <div className="flex items-center justify-between px-6 py-3 
                        bg-gray-900/50 backdrop-blur-xl border border-white/10 
                        rounded-full shadow-lg w-full max-w-6xl">

          {/* Logo */}
          <motion.div
            className="mr-6"
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/ui.png"
                alt="OSINT Hub Logo"
                className="w-10 h-8 drop-shadow-md"
              /><span className="text-xl font-bold tracking-wide hidden sm:block text-white">
                OSINT Hub
              </span>

            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((item) => (
              <motion.div key={item.name} whileHover={{ scale: 1.08 }}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
                    {item.name}
                  </a>
                ) : (
                  <a href={item.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
                    {item.name}
                  </a>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="https://github.com/rajarshidattapy/osinthub"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 border border-gray-700 rounded-full hover:border-indigo-500 transition-colors">
              <Github className="w-4 h-4" /> GitHub
            </a>

            <SignedIn>
              <div className="flex items-center space-x-4">
                <Link to="/dashboard"
                  className="inline-flex items-center justify-center px-4 py-2 
                                 text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 
                                 rounded-full hover:opacity-90 transition-colors shadow-lg">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <motion.button
                  className="inline-flex items-center justify-center px-5 py-2 
                             text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 
                             rounded-full hover:opacity-90 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}>
                  Get Started
                </motion.button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Toggle */}
          <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
            <Menu className="h-6 w-6 text-white" />
          </motion.button>
        </div>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl z-50 pt-24 px-6 md:hidden"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <motion.button
                className="absolute top-8 right-6 p-2"
                onClick={toggleMenu}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-white" />
              </motion.button>

              <div className="flex flex-col space-y-6">
                {navLinks.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                  >
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-lg text-white font-medium" onClick={toggleMenu}>
                        {item.name}
                      </a>
                    ) : (
                      <a href={item.href}
                        className="text-lg text-white font-medium" onClick={toggleMenu}>
                        {item.name}
                      </a>
                    )}
                  </motion.div>
                ))}

                <div className="pt-6 space-y-4">
                  <a href="https://github.com/rajarshidattapy/osinthub"
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 
                                text-base text-gray-200 border border-gray-700 rounded-full 
                                hover:border-indigo-500 transition-colors">
                    <Github className="w-5 h-5" /> GitHub
                  </a>

                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center justify-center w-full px-5 py-3 
                                         text-base text-white bg-gradient-to-r from-indigo-600 to-blue-600 
                                         rounded-full hover:opacity-90 transition-colors shadow-lg">
                        Get Started
                      </button>
                    </SignInButton>
                  </SignedOut>

                  <SignedIn>
                    <Link to="/dashboard"
                      className="inline-flex items-center justify-center w-full px-5 py-3 
                                     text-base text-white bg-gradient-to-r from-indigo-600 to-blue-600 
                                     rounded-full hover:opacity-90 transition-colors shadow-lg"
                      onClick={toggleMenu}>
                      Dashboard
                    </Link>
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
