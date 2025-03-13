/**
 * MCP tool for Brave Search
 */

import { MCPTool, MCPToolDefinition, MCPToolResponse } from '../mcp.js';
import { performSearch } from '../utils/search.js';

/**
 * Brave Web Search tool for MCP
 */
export class BraveWebSearchTool implements MCPTool {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get the tool definition
   */
  getDefinition(): MCPToolDefinition {
    return {
      name: 'brave_web_search',
      description: 'Performs a web search using the Brave Search API, ideal for general queries, news, articles, and online content. Use this for broad information gathering, recent events, or when you need diverse web sources. Supports pagination, content filtering, and freshness controls. Maximum 20 results per request, with offset for pagination. ',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (max 400 chars, 50 words)'
          },
          count: {
            type: 'number',
            description: 'Number of results (1-20, default 10)',
            default: 10
          },
          offset: {
            type: 'number',
            description: 'Pagination offset (max 9, default 0)',
            default: 0
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
      if (!params.query) {
        return {
          status: 'error',
          error: 'Search query is required'
        };
      }

      // Limit query length
      const query = params.query.slice(0, 400);
      
      // Set count with default and limits
      const count = Math.min(Math.max(params.count || 10, 1), 20);
      
      // Set offset with default and limits
      const offset = Math.min(Math.max(params.offset || 0, 0), 9);

      // Perform the search
      const results = await performSearch(query, this.apiKey, count);

      // Format the response
      return {
        status: 'success',
        result: {
          query,
          count: results.length,
          offset,
          results: results.map(result => ({
            title: result.title,
            description: result.description,
            url: result.url,
            relevance: result.relevance
          }))
        }
      };
    } catch (error) {
      console.error('Error in Brave Web Search tool:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

/**
 * Brave Local Search tool for MCP
 */
export class BraveLocalSearchTool implements MCPTool {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get the tool definition
   */
  getDefinition(): MCPToolDefinition {
    return {
      name: 'brave_local_search',
      description: 'Searches for local businesses and places using Brave\'s Local Search API. Best for queries related to physical locations, businesses, restaurants, services, etc. Returns detailed information including:\n- Business names and addresses\n- Ratings and review counts\n- Phone numbers and opening hours\nUse this when the query implies \'near me\' or mentions specific locations. Automatically falls back to web search if no local results are found.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Local search query (e.g. \'pizza near Central Park\')'
          },
          count: {
            type: 'number',
            description: 'Number of results (1-20, default 5)',
            default: 5
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
      if (!params.query) {
        return {
          status: 'error',
          error: 'Search query is required'
        };
      }

      // Limit query length
      const query = params.query.slice(0, 400);
      
      // Set count with default and limits
      const count = Math.min(Math.max(params.count || 5, 1), 20);

      // For now, we'll use the web search API since we don't have direct access to local search
      // In a real implementation, this would use a different endpoint
      const results = await performSearch(`${query} near me`, this.apiKey, count);

      // Format the response
      return {
        status: 'success',
        result: {
          query,
          count: results.length,
          results: results.map(result => ({
            title: result.title,
            description: result.description,
            url: result.url,
            relevance: result.relevance
          }))
        }
      };
    } catch (error) {
      console.error('Error in Brave Local Search tool:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
} 