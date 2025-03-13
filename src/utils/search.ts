/**
 * Utilities for performing searches using Brave Search API
 */

import axios from 'axios';
import { SearchResult } from '../types.js';

/**
 * Performs a search using the Brave Search API
 * @param query The search query
 * @param apiKey The Brave Search API key
 * @param count The number of results to return (max 20)
 * @returns Array of search results
 */
export async function performSearch(
  query: string,
  apiKey: string,
  count: number = 10
): Promise<SearchResult[]> {
  if (!query) {
    throw new Error('Search query is required');
  }

  if (!apiKey) {
    throw new Error('Brave Search API key is required');
  }

  // Limit count to maximum of 20 results
  const limitedCount = Math.min(count, 20);

  try {
    // Construct the API request URL
    const url = `https://api.search.brave.com/res/v1/web/search`;
    
    // Make the API request
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey
      },
      params: {
        q: query,
        count: limitedCount
      }
    });

    // Check if the response is valid
    if (!response.data || !response.data.web || !response.data.web.results) {
      return [];
    }

    // Parse the results
    const results: SearchResult[] = response.data.web.results.map((result: any) => {
      return {
        title: result.title || '',
        url: result.url || '',
        description: result.description || '',
        relevance: calculateRelevance(query, result.title, result.description)
      };
    });

    return results;
  } catch (error) {
    console.error('Error performing search:', error);
    throw new Error(`Failed to perform search: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Calculates the relevance score of a search result
 * @param query The search query
 * @param title The result title
 * @param description The result description
 * @returns A relevance score between 0 and 1
 */
function calculateRelevance(query: string, title: string, description: string): number {
  // Normalize the query and result text
  const normalizedQuery = query.toLowerCase();
  const normalizedTitle = title.toLowerCase();
  const normalizedDescription = description.toLowerCase();
  
  // Split the query into words
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
  
  // Count matches in title (weighted higher)
  let titleMatches = 0;
  for (const word of queryWords) {
    if (normalizedTitle.includes(word)) {
      titleMatches++;
    }
  }
  
  // Count matches in description
  let descriptionMatches = 0;
  for (const word of queryWords) {
    if (normalizedDescription.includes(word)) {
      descriptionMatches++;
    }
  }
  
  // Calculate relevance score (title matches weighted 3x)
  const maxPossibleScore = queryWords.length * 4; // 3 for title + 1 for description
  const actualScore = (titleMatches * 3) + descriptionMatches;
  
  // Return normalized score between 0 and 1
  return maxPossibleScore > 0 ? actualScore / maxPossibleScore : 0;
} 