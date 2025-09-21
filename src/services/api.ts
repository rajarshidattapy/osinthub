import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private getAuthHeaders = async (getToken: () => Promise<string | null>) => {
    const token = await getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Users
  async getCurrentUser(getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/users/me`, { headers });
    if (!response.ok) throw new Error('Failed to fetch current user');
    return response.json();
  }

  async updateCurrentUser(data: any, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  }

  // Repositories
  async getRepositories(getToken: () => Promise<string | null>, params?: any) {
    const headers = await this.getAuthHeaders(getToken);
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/repositories?${queryParams}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return response.json();
  }

  async getRepository(id: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/repositories/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch repository');
    return response.json();
  }

  async createRepository(data: any, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/repositories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create repository');
    return response.json();
  }

  async updateRepository(id: string, data: any, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/repositories/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update repository');
    return response.json();
  }

  async forkRepository(id: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/repositories/${id}/fork`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fork repository');
    return response.json();
  }

  // Files
  async getRepositoryFiles(repoId: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/files/repository/${repoId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch repository files');
    return response.json();
  }

  async getFile(id: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/files/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch file');
    return response.json();
  }

  async createFile(data: any, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create file');
    return response.json();
  }

  async updateFile(id: string, data: any, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update file');
    return response.json();
  }

  // Merge Requests
  async getMergeRequests(getToken: () => Promise<string | null>, params?: any) {
    const headers = await this.getAuthHeaders(getToken);
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/merge-requests?${queryParams}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch merge requests');
    return response.json();
  }

  async getMergeRequest(id: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/merge-requests/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch merge request');
    return response.json();
  }

  async createMergeRequest(data: any, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/merge-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create merge request');
    return response.json();
  }

  async updateMergeRequest(id: string, data: any, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/merge-requests/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update merge request');
    return response.json();
  }

  async mergeMergeRequest(id: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/merge-requests/${id}/merge`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to merge request');
    return response.json();
  }

  async closeMergeRequest(id: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/merge-requests/${id}/close`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to close merge request');
    return response.json();
  }

  // Commit Graph
  async importCommits(repositoryId: string, repoPath: string, maxCommits: number, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/commits/import`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ repo_path: repoPath, max_commits: maxCommits }),
    });
    if (!response.ok) throw new Error('Failed to import commits');
    return response.json();
  }

  async getCommits(repositoryId: string, getToken: () => Promise<string | null>, params?: any) {
    const headers = await this.getAuthHeaders(getToken);
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/commits?${queryParams}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch commits');
    return response.json();
  }

  async getCommitGraph(repositoryId: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/graph`, { headers });
    if (!response.ok) throw new Error('Failed to fetch commit graph');
    return response.json();
  }

  async generateCommitGraph(repositoryId: string, maxCommits: number, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/graph/generate?max_commits=${maxCommits}`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to generate commit graph');
    return response.json();
  }

  async getGraphStatistics(repositoryId: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/graph/statistics`, { headers });
    if (!response.ok) throw new Error('Failed to fetch graph statistics');
    return response.json();
  }
}

export const apiService = new ApiService();

// Custom hook for API calls with authentication
export const useApiService = () => {
  const { getToken } = useAuth();
  
  return {
    ...apiService,
    getToken,
  };
};