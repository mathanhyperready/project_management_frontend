export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface TimeEntry {
  [key: string]: string; // date as key, time as value (HH:MM:SS)
}


export interface Project {
  id: number;
  color: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on_hold';
  members: string[]; // user IDs
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  timeEntries: TimeEntry;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string; // user ID
  dueDate: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  actualHours?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'manager';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface ProjectFilters {
  status?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TaskFilters {
  status?: string;
  projectId?: string;
  assignedTo?: string;
  priority?: string;
  dueDate?: string;
  search?: string;
}
export interface EventType {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  project?: string;
  tags?: string[];
  billable?: boolean;
}



export interface AppContextType {
  events: EventType[];
  projects: Project[];
  addEvent: (event: EventType) => void;
  updateEvent: (id: number, event: Partial<EventType>) => void;
  deleteEvent: (id: number) => void;
  updateProjects: (projects: Project[]) => void;
}