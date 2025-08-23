// frontend/src/components/Layout/LandingNavbar.tsx
import { GitFork } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'; 
import { Link } from 'react-router-dom';

export function LandingNavbar() {
    return (
        <header className="absolute top-0 left-0 w-full z-30">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 mr-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <GitFork className="w-8 h-8 text-white" />
                            <span className="text-2xl font-bold text-white tracking-wide">OSINT Hub</span>
                        </Link>
                    </div>

                    {/* Navigation and CTA */}
                    <nav className="flex items-center space-x-6">
                        <SignedIn>
                            <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Go to Dashboard
                            </Link>
                            <UserButton afterSignOutUrl='/' />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </nav>
                </div>
            </div>
        </header>
    );
}