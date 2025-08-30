import { useState } from 'react';
import { Repository, MergeRequest } from '@/types';
import { Header } from '@/components/Layout/Header';
import { RepositoryList } from '@/components/Repository/RepositoryList';
import { RepositoryView } from '@/components/Repository/RepositoryView';
import { MergeRequestList } from '@/components/MergeRequest/MergeRequestList';
import { MergeRequestDetail } from '@/components/MergeRequest/MergeRequestDetail';
import { CreateRepositoryModal } from '@/components/CreateRepository/CreateRepositoryModal';

type AppView = 'repositories' | 'repository' | 'merge-requests' | 'merge-request-detail';

export function DashboardPage() {
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

  // The <SignedIn> wrapper will be in App.tsx now
  return (
    <div className="min-h-screen bg-gray-900">
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
    </div>
  );
}
