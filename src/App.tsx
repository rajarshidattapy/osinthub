// src/App.tsx

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

// Import your pages
import HomePage from './app/page';
import DashboardLayout from './app/dashboard/layout';
import DashboardHomePage from './app/dashboard/page';
import RepositoriesPage from './app/repositories/page';
import SingleRepositoryPage from './app/repositories/[repoId]/page';
import MergeRequestsPage from './app/merge-requests/page';

// Placeholder for pages you haven't built yet
const PlaceholderPage = ({ title }: { title: string }) => <div className="p-6 text-white">{title} Page - Coming Soon</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<HomePage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardHomePage /></ProtectedRoute>} />
        <Route path="/repositories" element={<ProtectedRoute><RepositoriesPage /></ProtectedRoute>} />
        <Route path="/repositories/:repoId" element={<ProtectedRoute><SingleRepositoryPage /></ProtectedRoute>} />
        <Route path="/merge-requests" element={<ProtectedRoute><MergeRequestsPage /></ProtectedRoute>} />
        
        {/* Add placeholders for other sidebar links */}
        <Route path="/case-files" element={<ProtectedRoute><PlaceholderPage title="Case Files" /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><PlaceholderPage title="Activity" /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PlaceholderPage title="Settings" /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}