import api from './axios';
import type { Role, PaginatedResponse, PaginationParams } from '../utils/types';
import { API_ENDPOINTS } from '../services/endpoint';

export const rolesAPI = {
  getRoles: async (params?: PaginationParams): Promise<PaginatedResponse<Role>> => {
    const response = await api.get<PaginatedResponse<Role>>(API_ENDPOINTS.ROLES.GET_ALL, { params });
    return response.data;
  },

  createRole: async (roleData: Partial<Role>): Promise<Role> => {
    const response = await api.post<Role>(API_ENDPOINTS.ROLES.CREATE, roleData);
    return response.data;
  },

  getRoleById: async (roleId: number): Promise<Role> => {
    const url = API_ENDPOINTS.ROLES.GET_SINGLE.replace('{role_id}', String(roleId));
    const response = await api.get<Role>(url);
    return response.data;
  },

  updateRole: async (roleId: number, roleData: Partial<Role>): Promise<Role> => {
    const url = API_ENDPOINTS.ROLES.UPDATE.replace('{role_id}', String(roleId));
    const response = await api.put<Role>(url, roleData);
    return response.data;
  },

  deleteRole: async (roleId: number): Promise<void> => {
    const url = API_ENDPOINTS.ROLES.DELETE.replace('{role_id}', String(roleId));
    await api.delete(url);
  },
};
