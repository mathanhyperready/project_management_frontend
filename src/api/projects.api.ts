import api from './axios';
import type { Project, PaginatedResponse, ProjectFilters, PaginationParams } from '../utils/types';

export const projectsAPI = {
  getProjects: async (params?: PaginationParams & ProjectFilters): Promise<PaginatedResponse<Project>> => {
    const response = await api.get<PaginatedResponse<Project>>('/projects', { params });
    return response.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const response = await api.post<Project>('/projects', projectData);
    return response.data;
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  addProjectMember: async (projectId: string, userId: string): Promise<Project> => {
    const response = await api.post<Project>(`/projects/${projectId}/members`, { userId });
    return response.data;
  },

  removeProjectMember: async (projectId: string, userId: string): Promise<Project> => {
    const response = await api.delete<Project>(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};