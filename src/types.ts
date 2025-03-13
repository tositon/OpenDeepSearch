/**
 * Types and interfaces for OpenDeepSearch
 */

// Type of research step
export enum ResearchStepType {
  QUESTION_ANALYSIS = 'question_analysis',
  SEARCH = 'search',
  RESULT_ANALYSIS = 'result_analysis',
  SYNTHESIS = 'synthesis',
  FOLLOW_UP = 'follow_up'
}

// Status of research
export enum ResearchStatus {
  PLANNING = 'planning',
  SEARCHING = 'searching',
  ANALYZING = 'analyzing',
  SYNTHESIZING = 'synthesizing',
  COMPLETED = 'completed'
}

// Data for one research step
export interface ResearchStep {
  id: string;
  type: ResearchStepType;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Sub-question
export interface SubQuestion {
  id: string;
  question: string;
  status: 'pending' | 'in-progress' | 'completed';
  searchResults?: SearchResult[];
  analysis?: string;
}

// Search result
export interface SearchResult {
  title: string;
  description: string;
  url: string;
  relevance?: number; // Relevance score from 0 to 1
}

// Complete research data
export interface ResearchData {
  id: string;
  question: string;
  subQuestions: SubQuestion[];
  steps: ResearchStep[];
  status: ResearchStatus;
  report?: string;
  startTime: number;
  endTime?: number;
}

// Options for the server
export interface DeepResearchOptions {
  braveApiKey: string;
  maxSubQuestions?: number; // Maximum number of sub-questions
  maxSearchesPerQuestion?: number; // Maximum number of searches per sub-question
  maxTotalSteps?: number; // Maximum number of research steps
  timeout?: number; // Timeout in milliseconds
} 