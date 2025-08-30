// frontend/src/components/ui/navbar.tsx

"use client" 

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, GitFork } from "lucide-react"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

// Navigation links for our landing page
const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
];

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <header className="fixed top-0 left-0 w-full z-50">
        <div className="flex justify-center w-full pt-6 px-4">
            <div className="flex items-center justify-between px-6 py-3 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-full shadow-lg w-full max-w-4xl">
                {/* Logo and Branding */}
                <div className="flex items-center">
                    <motion.div
                        className="mr-6"
                        whileHover={{ rotate: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link to="/" className="flex items-center space-x-2">
                            <GitFork className="w-8 h-8 text-white" />
                            <span className="text-xl font-bold text-white tracking-wide hidden sm:block">OSINT Hub</span>
                        </Link>
                    </motion.div>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map((item) => (
                    <motion.div
                        key={item.name}
                        whileHover={{ scale: 1.05 }}
                    >
                        <a href={item.href} className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
                        {item.name}
                        </a>
                    </motion.div>
                    ))}
                </nav>

                {/* Desktop CTA Button */}
                <div className="hidden md:block">
                    <SignedIn>
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard" className="inline-flex items-center justify-center px-4 py-2 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                                Dashboard
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                             <motion.button 
                                className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                                whileHover={{ scale: 1.05 }}
                             >
                                Get Started
                            </motion.button>
                        </SignInButton>
                    </SignedOut>
                </div>

                {/* Mobile Menu Button */}
                <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
                    <Menu className="h-6 w-6 text-white" />
                </motion.button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-gray-900/95 backdrop-blur-xl z-50 pt-24 px-6 md:hidden"
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
                            <a href={item.href} className="text-lg text-white font-medium" onClick={toggleMenu}>
                                {item.name}
                            </a>
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="pt-6"
                        >
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                                        Get Started
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Link to="/dashboard" className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors" onClick={toggleMenu}>
                                    Dashboard
                                </Link>
                            </SignedIn>
                        </motion.div>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    </header>
  )
}