/**
 * API client for communicating with the Athlete IQ backend
 */

import { Race, CreateRaceRequest, UpdateRaceRequest } from '@/types/race';
import { 
  TrainingPlanRequest, 
  TrainingPlansListResponse, 
  TrainingPlan 
} from '@/types/training-plan';

// Get API URL - in Next.js, process.env is replaced at build time
// Development: Uses .env.development.local or .env.local
// Production: Uses environment variables set in AWS Amplify Console
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper to detect if we're in development
export const isDevelopment = process.env.NODE_ENV === 'development';

// Log the API URL in development for debugging
if (isDevelopment && typeof window !== 'undefined') {
  console.log('API Base URL:', API_BASE_URL);
}

export interface IngestionRequest {
  user_id: string;
  access_token: string;
  refresh_token: string;
  full_sync?: boolean;
  sync_days?: number; // Optional: 1-1095 days
}

export interface IngestionStatus {
  user_id: string;
  status: 'in_progress' | 'completed' | 'failed';
  total_activities: number;
  processed_activities: number;
  failed_activities: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface SearchRequest {
  user_id: string;
  query: string;
  top_k?: number;
  filter_metadata?: Record<string, any>;
}

export interface SearchResult {
  activity_id: string;
  summary: string;
  score: number;
  activity_type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  metadata: Record<string, any>;
}

export interface UserStats {
  total_activities: number;
  ingestion_status?: IngestionStatus;
}

export interface ChatRequest {
  user_id: string;
  query: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  relevant_activities: SearchResult[];
  follow_up_questions: string[];
  conversation_id: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface InsightsRequest {
  user_id: string;
  time_period?: string;
}

// Training Plan Job Types
export interface TrainingPlanJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  message: string;
  created_at: string;
  estimated_duration_seconds: number;
}

export interface TrainingPlanJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  current_step: string;
  created_at: string;
  started_at: string | null;
  updated_at: string;
  completed_at: string | null;
  estimated_completion: string | null;
  retry_count: number;
  error_message: string | null;
  result_plan_id: string | null;
}

export interface TrainingPlanJobsListResponse {
  user_id: string;
  jobs: TrainingPlanJobStatus[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API request failed: ${response.status}`
      );
    }

    return response.json();
  }

  async startIngestion(request: IngestionRequest): Promise<{ message: string; user_id: string; status: string }> {
    return this.request('/api/activities/ingest', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getIngestionStatus(userId: string): Promise<IngestionStatus> {
    return this.request(`/api/activities/status/${userId}`);
  }

  async searchActivities(request: SearchRequest): Promise<SearchResult[]> {
    return this.request('/api/activities/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return this.request(`/api/users/${userId}/stats`);
  }

  async deleteUserData(userId: string): Promise<{ message: string }> {
    return this.request(`/api/users/${userId}/data`, {
      method: 'DELETE',
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  async chatWithAI(request: ChatRequest): Promise<ChatResponse> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getFitnessInsights(request: InsightsRequest): Promise<{ insights: string; time_period: string }> {
    return this.request('/api/insights', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getChatHistory(userId: string, conversationId?: string, limit: number = 50): Promise<{ history: ChatMessage[] }> {
    const params = new URLSearchParams({
      ...(conversationId && { conversation_id: conversationId }),
      limit: limit.toString(),
    });
    return this.request(`/api/chat/history/${userId}?${params}`);
  }

  async clearChatHistory(userId: string, conversationId?: string): Promise<{ message: string }> {
    const params = new URLSearchParams({
      ...(conversationId && { conversation_id: conversationId }),
    });
    return this.request(`/api/chat/history/${userId}?${params}`, {
      method: 'DELETE',
    });
  }

  async askFollowUp(request: ChatRequest): Promise<ChatResponse> {
    return this.request('/api/chat/follow-up', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Fitness endpoints
  async getUserTSSData(userId: string): Promise<any> {
    return this.request(`/api/fitness/${userId}/tss`);
  }

  async getUserFitnessMetrics(userId: string): Promise<any> {
    return this.request(`/api/fitness/${userId}/metrics`);
  }

  async getUserFitnessStatus(userId: string): Promise<any> {
    return this.request(`/api/fitness/${userId}/status`);
  }

  async getUserThresholds(userId: string): Promise<any> {
    return this.request(`/api/fitness/${userId}/thresholds?t=${Date.now()}`);
  }

  // Debug endpoint
  async debugActivityTypes(userId: string): Promise<any> {
    return this.request(`/api/debug/activity-types/${userId}`);
  }

  async getConfig(): Promise<any> {
    return this.request('/api/config');
  }

  async getLatestActivity(userId: string): Promise<any> {
    return this.request(`/api/activities/${userId}/latest`);
  }

  // Race API methods
  async createRace(request: CreateRaceRequest): Promise<Race> {
    return this.request('/api/races', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getUserRaces(userId: string, upcomingOnly?: boolean): Promise<Race[]> {
    const params = upcomingOnly ? '?upcoming_only=true' : '';
    return this.request(`/api/races/${userId}${params}`);
  }

  async getRace(userId: string, raceId: string): Promise<Race> {
    return this.request(`/api/races/${userId}/${raceId}`);
  }

  async updateRace(userId: string, raceId: string, request: UpdateRaceRequest): Promise<Race> {
    return this.request(`/api/races/${userId}/${raceId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteRace(userId: string, raceId: string): Promise<{ message: string }> {
    return this.request(`/api/races/${userId}/${raceId}`, {
      method: 'DELETE',
    });
  }

  // Training Plan API methods
  async generateTrainingPlan(request: TrainingPlanRequest): Promise<TrainingPlanJob> {
    return this.request('/api/training-plans/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getTrainingPlanJobStatus(jobId: string, userId: string): Promise<TrainingPlanJobStatus> {
    return this.request(`/api/training-plans/jobs/${jobId}/status?user_id=${userId}`);
  }

  async getUserTrainingPlanJobs(userId: string, status?: string): Promise<TrainingPlanJobsListResponse> {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/training-plans/jobs/${userId}${params}`);
  }

  async cancelTrainingPlanJob(jobId: string, userId: string): Promise<{ message: string }> {
    return this.request(`/api/training-plans/jobs/${jobId}/cancel?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async getTrainingPlanJobResult(jobId: string, userId: string): Promise<TrainingPlan> {
    return this.request(`/api/training-plans/jobs/${jobId}/result?user_id=${userId}`);
  }

  async getUserTrainingPlans(userId: string, activeOnly?: boolean): Promise<TrainingPlansListResponse> {
    const params = activeOnly ? '?active_only=true' : '';
    return this.request(`/api/training-plans/${userId}${params}`);
  }

  async getTrainingPlanDetails(userId: string, planId: string): Promise<TrainingPlan> {
    return this.request(`/api/training-plans/${userId}/${planId}`);
  }

  async deleteTrainingPlan(userId: string, planId: string): Promise<{ message: string }> {
    return this.request(`/api/training-plans/${userId}/${planId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();