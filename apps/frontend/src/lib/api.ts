const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getMe() {
    return this.request<any>('/users/me');
  }

  async getMyStats() {
    return this.request<any>('/users/me/stats');
  }

  // Projects
  async getProjects(page = 1, limit = 20) {
    return this.request<any>(`/projects?page=${page}&limit=${limit}`);
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  async createProject(data: any) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<any>(`/projects/${id}`, { method: 'DELETE' });
  }

  // Pipelines
  async getPipelines(projectId: string, page = 1) {
    return this.request<any>(`/pipelines/project/${projectId}?page=${page}`);
  }

  async getPipeline(id: string) {
    return this.request<any>(`/pipelines/${id}`);
  }

  async runPipeline(projectId: string, branch?: string) {
    return this.request<any>('/pipelines/run', {
      method: 'POST',
      body: JSON.stringify({ projectId, branch }),
    });
  }

  async cancelPipeline(id: string) {
    return this.request<any>(`/pipelines/${id}/cancel`, { method: 'POST' });
  }

  async retryPipeline(id: string) {
    return this.request<any>(`/pipelines/${id}/retry`, { method: 'POST' });
  }

  // Jobs
  async getJob(id: string) {
    return this.request<any>(`/jobs/${id}`);
  }

  async getJobLogs(id: string, page = 1) {
    return this.request<any>(`/jobs/${id}/logs?page=${page}`);
  }

  // Deployments
  async getDeployments(projectId: string, page = 1) {
    return this.request<any>(`/deployments/project/${projectId}?page=${page}`);
  }

  async getDeployment(id: string) {
    return this.request<any>(`/deployments/${id}`);
  }

  async createDeployment(data: any) {
    return this.request<any>('/deployments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rollbackDeployment(id: string) {
    return this.request<any>(`/deployments/${id}/rollback`, { method: 'POST' });
  }

  async promoteDeployment(id: string) {
    return this.request<any>(`/deployments/${id}/promote`, { method: 'POST' });
  }

  // Secrets
  async getSecrets(projectId: string) {
    return this.request<any>(`/projects/${projectId}/secrets`);
  }

  async createSecret(projectId: string, key: string, value: string) {
    return this.request<any>(`/projects/${projectId}/secrets`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  async deleteSecret(projectId: string, key: string) {
    return this.request<any>(`/projects/${projectId}/secrets/${key}`, {
      method: 'DELETE',
    });
  }

  // Logs
  async getLogs(jobId: string, fromLine?: number) {
    const query = fromLine ? `?from=${fromLine}` : '';
    return this.request<any>(`/logs/${jobId}${query}`);
  }
}

export const api = new ApiClient();
