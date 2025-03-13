/**
 * MCP tool for Deep Research
 * Combines Sequential Thinking and Brave Search for comprehensive research
 */

import { MCPTool, MCPToolDefinition, MCPToolResponse } from '../mcp.js';
import { v4 as uuidv4 } from 'uuid';
import { analyzeQuestion } from '../utils/question.js';
import { performSearch } from '../utils/search.js';
import { analyzeResults } from '../utils/analysis.js';
import { synthesizeReport } from '../utils/synthesis.js';
import { ResearchData, ResearchStatus, ResearchStep, ResearchStepType, SubQuestion } from '../types.js';

/**
 * Deep Research tool for MCP
 */
export class DeepResearchTool implements MCPTool {
  private apiKey: string;
  private researches: Map<string, ResearchData> = new Map();
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get the tool definition
   */
  getDefinition(): MCPToolDefinition {
    return {
      name: 'deep_research',
      description: 'Performs comprehensive, in-depth research on complex topics. Combines Sequential Thinking with Brave Search to provide detailed, well-sourced research reports. Ideal for academic research, complex questions, and topics requiring synthesis of multiple sources.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The research question or topic'
          },
          maxSubQuestions: {
            type: 'number',
            description: 'Maximum number of sub-questions to generate (default: 5)',
            default: 5
          },
          maxSearchesPerQuestion: {
            type: 'number',
            description: 'Maximum number of searches per sub-question (default: 2)',
            default: 2
          },
          researchId: {
            type: 'string',
            description: 'ID of an existing research to continue or retrieve'
          },
          action: {
            type: 'string',
            description: 'Action to perform: "start", "status", "continue", or "report"',
            default: 'start'
          }
        },
        required: ['query']
      }
    };
  }

  /**
   * Execute the tool
   * @param params Tool parameters
   * @returns Tool response
   */
  async execute(params: any): Promise<MCPToolResponse> {
    try {
      // Validate parameters
      if (!params.query && !params.researchId) {
        return {
          status: 'error',
          error: 'Either query or researchId is required'
        };
      }

      // Determine the action
      const action = params.action || 'start';
      
      // Handle different actions
      switch (action) {
        case 'start':
          return this.startResearch(params);
        case 'status':
          return this.getResearchStatus(params);
        case 'continue':
          return this.continueResearch(params);
        case 'report':
          return this.generateReport(params);
        default:
          return {
            status: 'error',
            error: `Invalid action: ${action}`
          };
      }
    } catch (error) {
      console.error('Error in Deep Research tool:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Start a new research
   * @param params Tool parameters
   * @returns Tool response
   */
  private async startResearch(params: any): Promise<MCPToolResponse> {
    // Generate a research ID
    const researchId = uuidv4();
    
    // Create a new research data object
    const research: ResearchData = {
      id: researchId,
      question: params.query,
      subQuestions: [],
      steps: [],
      status: ResearchStatus.PLANNING,
      startTime: Date.now()
    };
    
    // Store the research
    this.researches.set(researchId, research);
    
    // Add the first step - question analysis
    const step: ResearchStep = {
      id: uuidv4(),
      type: ResearchStepType.QUESTION_ANALYSIS,
      content: `Analyzing question: "${params.query}"`,
      timestamp: Date.now()
    };
    
    research.steps.push(step);
    
    // Analyze the question to generate sub-questions
    const subQuestions = await analyzeQuestion(params.query);
    
    // Limit the number of sub-questions
    const maxSubQuestions = Math.min(params.maxSubQuestions || 5, 10);
    const limitedSubQuestions = subQuestions.slice(0, maxSubQuestions);
    
    // Create sub-question objects
    research.subQuestions = limitedSubQuestions.map(question => ({
      id: uuidv4(),
      question,
      status: 'pending'
    }));
    
    // Update the step with the sub-questions
    step.content = `Analyzed question: "${params.query}"\nGenerated ${research.subQuestions.length} sub-questions:\n${research.subQuestions.map(sq => `- ${sq.question}`).join('\n')}`;
    
    // Update the research status
    research.status = ResearchStatus.SEARCHING;
    
    // Return the response
    return {
      status: 'success',
      result: {
        researchId,
        question: params.query,
        subQuestions: research.subQuestions.map(sq => sq.question),
        status: research.status
      }
    };
  }

  /**
   * Get the status of a research
   * @param params Tool parameters
   * @returns Tool response
   */
  private getResearchStatus(params: any): Promise<MCPToolResponse> {
    // Get the research ID
    const researchId = params.researchId;
    
    // Check if the research exists
    if (!researchId || !this.researches.has(researchId)) {
      return Promise.resolve({
        status: 'error',
        error: `Research not found: ${researchId}`
      });
    }
    
    // Get the research
    const research = this.researches.get(researchId)!;
    
    // Return the status
    return Promise.resolve({
      status: 'success',
      result: {
        researchId,
        question: research.question,
        status: research.status,
        subQuestions: research.subQuestions.map(sq => ({
          question: sq.question,
          status: sq.status
        })),
        steps: research.steps.length,
        startTime: research.startTime,
        endTime: research.endTime
      }
    });
  }

  /**
   * Continue a research
   * @param params Tool parameters
   * @returns Tool response
   */
  private async continueResearch(params: any): Promise<MCPToolResponse> {
    // Get the research ID
    const researchId = params.researchId;
    
    // Check if the research exists
    if (!researchId || !this.researches.has(researchId)) {
      return {
        status: 'error',
        error: `Research not found: ${researchId}`
      };
    }
    
    // Get the research
    const research = this.researches.get(researchId)!;
    
    // Check if the research is already completed
    if (research.status === ResearchStatus.COMPLETED) {
      return {
        status: 'success',
        result: {
          researchId,
          question: research.question,
          status: research.status,
          message: 'Research is already completed'
        }
      };
    }
    
    // Find the next pending sub-question
    const nextSubQuestion = research.subQuestions.find(sq => sq.status === 'pending');
    
    // If there are no more pending sub-questions, synthesize the results
    if (!nextSubQuestion) {
      return this.synthesizeResults(research);
    }
    
    // Mark the sub-question as in-progress
    nextSubQuestion.status = 'in-progress';
    
    // Add a search step
    const searchStep: ResearchStep = {
      id: uuidv4(),
      type: ResearchStepType.SEARCH,
      content: `Searching for: "${nextSubQuestion.question}"`,
      timestamp: Date.now()
    };
    
    research.steps.push(searchStep);
    
    // Perform the search
    const searchResults = await performSearch(nextSubQuestion.question, this.apiKey, 10);
    
    // Store the search results
    nextSubQuestion.searchResults = searchResults;
    
    // Update the search step
    searchStep.content = `Searched for: "${nextSubQuestion.question}"\nFound ${searchResults.length} results`;
    
    // Add an analysis step
    const analysisStep: ResearchStep = {
      id: uuidv4(),
      type: ResearchStepType.RESULT_ANALYSIS,
      content: `Analyzing results for: "${nextSubQuestion.question}"`,
      timestamp: Date.now()
    };
    
    research.steps.push(analysisStep);
    
    // Analyze the results
    const analysis = await analyzeResults(searchResults, nextSubQuestion.question);
    
    // Store the analysis
    nextSubQuestion.analysis = analysis;
    
    // Update the analysis step
    analysisStep.content = `Analyzed results for: "${nextSubQuestion.question}"`;
    
    // Mark the sub-question as completed
    nextSubQuestion.status = 'completed';
    
    // Return the response
    return {
      status: 'success',
      result: {
        researchId,
        question: research.question,
        subQuestionCompleted: nextSubQuestion.question,
        remainingSubQuestions: research.subQuestions.filter(sq => sq.status === 'pending').length,
        status: research.status
      }
    };
  }

  /**
   * Synthesize the results of a research
   * @param research The research data
   * @returns Tool response
   */
  private async synthesizeResults(research: ResearchData): Promise<MCPToolResponse> {
    // Add a synthesis step
    const synthesisStep: ResearchStep = {
      id: uuidv4(),
      type: ResearchStepType.SYNTHESIS,
      content: 'Synthesizing research results',
      timestamp: Date.now()
    };
    
    research.steps.push(synthesisStep);
    
    // Update the research status
    research.status = ResearchStatus.SYNTHESIZING;
    
    // Synthesize the report
    const report = await synthesizeReport(research.question, research.subQuestions);
    
    // Store the report
    research.report = report;
    
    // Update the synthesis step
    synthesisStep.content = 'Synthesized research results';
    
    // Update the research status and end time
    research.status = ResearchStatus.COMPLETED;
    research.endTime = Date.now();
    
    // Return the response
    return {
      status: 'success',
      result: {
        researchId: research.id,
        question: research.question,
        status: research.status,
        message: 'Research completed',
        reportPreview: report.substring(0, 500) + '...'
      }
    };
  }

  /**
   * Generate a report for a research
   * @param params Tool parameters
   * @returns Tool response
   */
  private generateReport(params: any): Promise<MCPToolResponse> {
    // Get the research ID
    const researchId = params.researchId;
    
    // Check if the research exists
    if (!researchId || !this.researches.has(researchId)) {
      return Promise.resolve({
        status: 'error',
        error: `Research not found: ${researchId}`
      });
    }
    
    // Get the research
    const research = this.researches.get(researchId)!;
    
    // Check if the research is completed
    if (research.status !== ResearchStatus.COMPLETED) {
      return Promise.resolve({
        status: 'error',
        error: 'Research is not yet completed'
      });
    }
    
    // Return the report
    return Promise.resolve({
      status: 'success',
      result: {
        researchId,
        question: research.question,
        report: research.report,
        subQuestions: research.subQuestions.length,
        steps: research.steps.length,
        startTime: research.startTime,
        endTime: research.endTime,
        duration: (research.endTime! - research.startTime) / 1000
      }
    });
  }
} 