import axios from 'axios';
import type { User, Engineer, Project, Assignment } from '../types';

const API_BASE_URL = 'https://erm-project-server-ppkin3eou-srajan-0407s-projects.vercel.app/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: { name: string; email: string; password: string; role?: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Engineers API
export const engineersAPI = {
  getAll: async (params?: { skill?: string; seniority?: string; available?: boolean }): Promise<Engineer[]> => {
    const response = await api.get('/engineers', { params });
    return response.data;
  },
  
  getById: async (id: string): Promise<Engineer> => {
    const response = await api.get(`/engineers/${id}`);
    return response.data;
  },
  
  create: async (engineerData: Partial<Engineer>): Promise<Engineer> => {
    const response = await api.post('/engineers', engineerData);
    return response.data;
  },
  
  update: async (id: string, engineerData: Partial<Engineer>): Promise<Engineer> => {
    const response = await api.put(`/engineers/${id}`, engineerData);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/engineers/${id}`);
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (params?: { status?: string; skill?: string }): Promise<Project[]> => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  
  getById: async (id: string): Promise<Project & { assignments: Assignment[] }> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (projectData: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  
  update: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
};

// Assignments API
export const assignmentsAPI = {
  getAll: async (): Promise<Assignment[]> => {
    const response = await api.get('/assignments');
    return response.data;
  },
  
  create: async (assignmentData: {
    engineer: string;
    project: string;
    allocationPercentage: number;
    startDate: string;
    endDate: string;
    role: string;
  }): Promise<Assignment> => {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  },
};

export const getAvailableCapacity = (engineer: Engineer, assignments: Assignment[]): number => {
  const activeAssignments = assignments.filter(
    a => a.engineer._id === engineer._id && a.status === 'active'
  );
  
  const totalAllocated = activeAssignments.reduce(
    (sum, assignment) => sum + assignment.allocationPercentage,
    0
  );
  
  return engineer.maxCapacity - totalAllocated;
};