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
    const data = await response.json().catch(() => undefined);
    if (!response.ok) {
      const message = typeof data === 'object' && data?.detail?.message ? data.detail.message : (data?.detail || 'Failed to merge request');
      const error = new Error(message) as any;
      if (data?.detail) error.detail = data.detail;
      throw error;
    }
    return data;
  }

  async closeMergeRequest(id: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/merge-requests/${id}/close`, {
      method: 'POST',
      headers,
    });
    const data = await response.json().catch(() => undefined);
    if (!response.ok) {
      const message = data?.detail || 'Failed to close merge request';
      const error = new Error(message) as any;
      if (data?.detail) error.detail = data.detail;
      throw error;
    }
    return data;
  }

  async validateMergeRequest(id: string, getToken: () => Promise<string | null>) {
    const headers = await this.getAuthHeaders(getToken);
    const response = await fetch(`${API_BASE_URL}/merge-requests/${id}/validate`, {
      method: 'POST',
      headers,
    });
    const data = await response.json().catch(() => undefined);
    if (!response.ok) {
      const message = data?.detail || 'Failed to validate merge request';
      const error = new Error(message) as any;
      if (data?.detail) error.detail = data.detail;
      throw error;
    }
    return data;
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

  // Chatbot
  async queryRepositoryChatbot(
    question: string,
    repository: any,
    commits: any[],
    files: any[],
    getToken: () => Promise<string | null>,
    onChunk?: (chunk: string) => void
  ) {
    // Use streaming endpoint for better UX
    try {
      const headers = await this.getAuthHeaders(getToken);
      const response = await fetch(`${API_BASE_URL}/chatbot/query-stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question,
          repository,
          commits,
          files
        }),
      });
      
      if (response.ok && onChunk) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    fullResponse += data.content;
                    onChunk(data.content);
                  }
                  if (data.done) {
                    return { answer: fullResponse };
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        }
        return { answer: fullResponse };
      }
    } catch (error) {
      console.log('Streaming endpoint failed, trying simple endpoint');
    }
    
    // Fallback to simple endpoint without authentication
    const response = await fetch(`${API_BASE_URL}/chatbot/query-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        repository,
        commits,
        files
      }),
    });
    if (!response.ok) throw new Error('Failed to get chatbot response');
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
    queryRepositoryChatbot: (question: string, repository: any, commits: any[], files: any[], getToken: () => Promise<string | null>, onChunk?: (chunk: string) => void) => 
      apiService.queryRepositoryChatbot(question, repository, commits, files, getToken, onChunk),
  };
};