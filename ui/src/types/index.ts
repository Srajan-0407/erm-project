export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'engineer';
}

export interface Engineer {
  _id: string;
  user?: string;
  name: string;
  email: string;
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  department: string;
  maxCapacity: number;
  status: 'active' | 'inactive';
  availableCapacity?: number;
  isAvailable?: boolean;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  requiredSkills: string[];
  teamSize: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  manager: User;
}

export interface Assignment {
  _id: string;
  engineer: Engineer;
  project: Project;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  role: string;
  assignedBy: User;
}