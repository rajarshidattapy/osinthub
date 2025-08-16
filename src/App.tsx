import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Header } from './components/Layout/Header';
import { RepositoryList } from './components/Repository/RepositoryList';
import { RepositoryView } from './components/Repository/RepositoryView';
import { MergeRequestList } from './components/MergeRequest/MergeRequestList';
import { MergeRequestDetail } from './components/MergeRequest/MergeRequestDetail';
import { CreateRepositoryModal } from './components/CreateRepository/CreateRepositoryModal';
import { Repository, MergeRequest } from './types';
import { repositories, mergeRequests } from './data/mockData';

type AppView = 'repositories' | 'repository' | 'merge-requests' | 'merge-request-detail';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('repositories');
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [selectedMergeRequest, setSelectedMergeRequest] = useState<MergeRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelectRepository = (repo: Repository) => {
    setSelectedRepository(repo);
    setCurrentView('repository');
  };

  const handleBack = () => {
    setCurrentView('repositories');
    setSelectedRepository(null);
    setSelectedMergeRequest(null);
  };

  const handleForkRepository = (repo: Repository) => {
    // In a real app, this would create a fork
    console.log('Forking repository:', repo.name);
  };

  const handleViewMergeRequests = () => {
    setCurrentView('merge-requests');
  };

  const handleSelectMergeRequest = (mr: MergeRequest) => {
    setSelectedMergeRequest(mr);
    setCurrentView('merge-request-detail');
  };

  const handleBackToMergeRequests = () => {
    setCurrentView('merge-requests');
    setSelectedMergeRequest(null);
  };

  const handleCreateRepository = () => {
    setShowCreateModal(true);
  };

  const handleSubmitRepository = (data: any) => {
    // In a real app, this would create the repository
    console.log('Creating repository:', data);
  };

  const getCurrentPageTitle = () => {
    switch (currentView) {
      case 'repository': return selectedRepository?.name;
      case 'merge-requests': return 'Pull Requests';
      case 'merge-request-detail': return 'Pull Request';
      default: return 'Repositories';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <GitFork className="w-12 h-12 text-white" />
                <span className="text-4xl font-bold text-white">OSINT Hub</span>
              </div>
              <p className="text-gray-400 text-lg">Collaborative Intelligence Investigations</p>
            </div>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <Header currentPage={getCurrentPageTitle()} />
        
        {currentView === 'repositories' && (
          <RepositoryList 
            onSelectRepository={handleSelectRepository}
            onCreateRepository={handleCreateRepository}
          />
        )}
        
        {currentView === 'repository' && selectedRepository && (
          <RepositoryView 
            repository={selectedRepository}
            onBack={handleBack}
            onFork={handleForkRepository}
            onViewMergeRequests={handleViewMergeRequests}
          />
        )}
        
        {currentView === 'merge-requests' && (
          <MergeRequestList 
            onBack={() => setCurrentView('repository')}
            onSelectMergeRequest={handleSelectMergeRequest}
          />
        )}
        
        {currentView === 'merge-request-detail' && selectedMergeRequest && (
          <MergeRequestDetail 
            mergeRequest={selectedMergeRequest}
            onBack={handleBackToMergeRequests}
          />
        )}

        <CreateRepositoryModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleSubmitRepository}
        />
      </SignedIn>
    </div>
  );
}

export default App;