import { apiClient } from '../api-client';
import { Task, TaskCreate, TaskUpdate, MessageResponse } from '@/types/api';

export const taskService = {
  /**
   * Get all tasks
   */
  getTasks: async (): Promise<Task[]> => {
    return apiClient.get<Task[]>('/tasks/');
  },

  /**
   * Get a specific task by ID
   */
  getTask: async (id: number): Promise<Task> => {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  /**
   * Create a new task
   */
  createTask: async (data: TaskCreate): Promise<Task> => {
    return apiClient.post<Task>('/tasks/', data);
  },

  /**
   * Update an existing task
   */
  updateTask: async (id: number, data: TaskUpdate): Promise<Task> => {
    return apiClient.put<Task>(`/tasks/${id}`, data);
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: number): Promise<MessageResponse> => {
    return apiClient.delete<MessageResponse>(`/tasks/${id}`);
  },

  /**
   * Toggle task completion status
   */
  toggleTask: async (id: number): Promise<Task> => {
    return apiClient.post<Task>(`/tasks/${id}/toggle`, {});
  },

  /**
   * Get tasks filtered by completion status
   */
  getTasksByStatus: async (completed: boolean): Promise<Task[]> => {
    return apiClient.get<Task[]>(`/tasks/?completed=${completed}`);
  },
};
