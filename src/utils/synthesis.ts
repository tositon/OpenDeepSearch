/**
 * Utilities for synthesizing research results into a coherent report
 */

import { SubQuestion } from '../types.js';

/**
 * Synthesizes research results into a coherent report
 * @param mainQuestion The main research question
 * @param subQuestions Array of sub-questions with their analysis
 * @returns Synthesized research report
 */
export async function synthesizeReport(
  mainQuestion: string,
  subQuestions: SubQuestion[]
): Promise<string> {
  if (!subQuestions || subQuestions.length === 0) {
    return `No research data available for question: "${mainQuestion}"`;
  }

  // Filter completed sub-questions
  const completedSubQuestions = subQuestions.filter(sq => sq.status === 'completed' && sq.analysis);
  
  if (completedSubQuestions.length === 0) {
    return `Research is still in progress for question: "${mainQuestion}"`;
  }
  
  // Generate introduction
  const introduction = generateIntroduction(mainQuestion);
  
  // Generate sections for each sub-question
  const sections = completedSubQuestions.map(sq => {
    return generateSection(sq.question, sq.analysis || '', sq.searchResults || []);
  });
  
  // Generate conclusion
  const conclusion = generateConclusion(mainQuestion, completedSubQuestions);
  
  // Generate sources section
  const sources = generateSources(completedSubQuestions);
  
  // Combine all parts into a complete report
  const report = `
# Research Report: ${mainQuestion}

## Introduction
${introduction}

${sections.join('\n\n')}

## Conclusion
${conclusion}

## Sources
${sources}
`;

  return report;
}

/**
 * Generates the introduction section
 * @param mainQuestion The main research question
 * @returns Introduction text
 */
function generateIntroduction(mainQuestion: string): string {
  return `This report presents a comprehensive analysis of the question: "${mainQuestion}". 
The research was conducted using multiple sources and approaches to provide a thorough understanding of the topic.`;
}

/**
 * Generates a section for a sub-question
 * @param question The sub-question
 * @param analysis The analysis text
 * @param searchResults The search results
 * @returns Formatted section text
 */
function generateSection(
  question: string,
  analysis: string,
  searchResults: { title: string; url: string }[]
): string {
  // Extract a section title from the question
  const sectionTitle = question.replace(/\?/g, '').trim();
  
  // Format the section
  return `## ${sectionTitle}

${analysis}

${generateCitations(analysis, searchResults)}`;
}

/**
 * Generates citation markers for the analysis text
 * @param analysis The analysis text
 * @param searchResults The search results
 * @returns Text with citation markers
 */
function generateCitations(
  analysis: string,
  searchResults: { title: string; url: string }[]
): string {
  // In a real implementation, this would use NLP to match text to sources
  // For the prototype, we'll use a simple approach
  
  if (!searchResults || searchResults.length === 0) {
    return '';
  }
  
  // Create citation notes
  const citations = searchResults.map((result, index) => {
    return `[${index + 1}] ${result.title} - ${result.url}`;
  });
  
  return `**Sources:**\n${citations.join('\n')}`;
}

/**
 * Generates the conclusion section
 * @param mainQuestion The main research question
 * @param subQuestions The sub-questions with analysis
 * @returns Conclusion text
 */
function generateConclusion(
  mainQuestion: string,
  subQuestions: SubQuestion[]
): string {
  return `This research has explored various aspects of ${extractMainTopic(mainQuestion)}. 
The findings from different sub-questions provide a comprehensive understanding of the topic.
The research was based on ${subQuestions.length} sub-questions and utilized multiple sources to ensure accuracy and depth.`;
}

/**
 * Generates the sources section
 * @param subQuestions The sub-questions with search results
 * @returns Formatted sources text
 */
function generateSources(subQuestions: SubQuestion[]): string {
  // Collect all unique sources
  const allSources = new Map<string, { title: string; url: string }>();
  
  subQuestions.forEach(sq => {
    if (sq.searchResults) {
      sq.searchResults.forEach(result => {
        if (!allSources.has(result.url)) {
          allSources.set(result.url, { title: result.title, url: result.url });
        }
      });
    }
  });
  
  // Format the sources
  const sourcesList = Array.from(allSources.values()).map((source, index) => {
    return `${index + 1}. ${source.title} - ${source.url}`;
  });
  
  return sourcesList.join('\n');
}

/**
 * Extracts the main topic from a question
 * @param question The question
 * @returns The main topic
 */
function extractMainTopic(question: string): string {
  // Remove question words at the beginning
  const withoutQuestionWords = question
    .replace(/^(what|who|when|where|why|how|is|are|do|does|did|can|could|would|should|will)\s+/i, '')
    .trim();
  
  // If the question starts with "the", "a", "an", remove the article
  const withoutArticles = withoutQuestionWords
    .replace(/^(the|a|an)\s+/i, '')
    .trim();
  
  // If there's anything left, return it as the main topic
  return withoutArticles.length > 0 ? withoutArticles : question;
} 