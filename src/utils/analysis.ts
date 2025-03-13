/**
 * Utilities for analyzing search results
 */

import { SearchResult } from '../types.js';

/**
 * Analyzes search results and extracts key information
 * @param results Array of search results
 * @param query The original search query
 * @returns Analysis report
 */
export async function analyzeResults(
  results: SearchResult[],
  query: string
): Promise<string> {
  if (!results || results.length === 0) {
    return `No results found for query: "${query}"`;
  }

  // Sort results by relevance
  const sortedResults = [...results].sort((a, b) => {
    const relevanceA = a.relevance ?? 0;
    const relevanceB = b.relevance ?? 0;
    return relevanceB - relevanceA;
  });
  
  // Take the top 5 most relevant results
  const topResults = sortedResults.slice(0, 5);
  
  // Extract key information from each result
  const analysisPoints = topResults.map((result, index) => {
    const keyInfo = extractKeyInformation(result, query);
    return `${index + 1}. ${result.title}\n   ${keyInfo}\n   Source: ${result.url}`;
  });
  
  // Format the analysis report
  const report = `
Analysis for query: "${query}"

Key Information:
${analysisPoints.join('\n\n')}

This analysis is based on the top ${topResults.length} most relevant results.
`;

  return report;
}

/**
 * Extracts key information from a search result
 * @param result The search result
 * @param query The original search query
 * @returns Extracted key information
 */
function extractKeyInformation(result: SearchResult, query: string): string {
  // In a real implementation, this would use NLP techniques
  // For the prototype, we'll use a simple approach
  
  // Get the most relevant sentences from the description
  const relevantSentences = selectRelevantSentences(result.description, query, 2);
  
  return relevantSentences.join(' ');
}

/**
 * Selects the most relevant sentences from a text
 * @param text The text to analyze
 * @param query The search query
 * @param maxSentences Maximum number of sentences to return
 * @returns Array of relevant sentences
 */
function selectRelevantSentences(text: string, query: string, maxSentences: number): string[] {
  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return [text];
  }
  
  // Calculate relevance score for each sentence
  const scoredSentences = sentences.map(sentence => {
    const score = calculateSentenceRelevance(sentence, query);
    return { sentence, score };
  });
  
  // Sort by relevance score
  scoredSentences.sort((a, b) => b.score - a.score);
  
  // Return the top N sentences
  return scoredSentences.slice(0, maxSentences).map(s => s.sentence.trim());
}

/**
 * Calculates the relevance of a sentence to a query
 * @param sentence The sentence
 * @param query The query
 * @returns A relevance score
 */
function calculateSentenceRelevance(sentence: string, query: string): number {
  const normalizedSentence = sentence.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  // Split query into words
  const queryWords = normalizedQuery.split(/\s+/).filter(word => !isStopWord(word) && word.length > 2);
  
  // Count how many query words appear in the sentence
  let matchCount = 0;
  for (const word of queryWords) {
    if (normalizedSentence.includes(word)) {
      matchCount++;
    }
  }
  
  // Calculate score based on match percentage and sentence length
  const matchPercentage = queryWords.length > 0 ? matchCount / queryWords.length : 0;
  const lengthFactor = 1 - Math.min(Math.abs(normalizedSentence.length - 100) / 100, 0.5);
  
  return matchPercentage * 0.7 + lengthFactor * 0.3;
}

/**
 * Checks if a word is a common stop word
 * @param word The word to check
 * @returns True if it's a stop word
 */
function isStopWord(word: string): boolean {
  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
    'which', 'this', 'that', 'these', 'those', 'then', 'just', 'so', 'than',
    'such', 'both', 'through', 'about', 'for', 'is', 'of', 'while', 'during',
    'to', 'from', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
    'will', 'just', 'don', 'should', 'now'
  ];
  
  return stopWords.includes(word.toLowerCase());
} 