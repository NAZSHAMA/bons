export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
