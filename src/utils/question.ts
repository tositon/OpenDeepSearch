/**
 * Utilities for working with questions
 */

// Если в будущем будут добавлены импорты, они должны включать расширение .js
// import { SomeType } from '../types.js';

/**
 * Analyzes the main question and breaks it down into sub-questions
 * @param question The main question
 * @returns Array of sub-questions
 */
export async function analyzeQuestion(question: string): Promise<string[]> {
  // In a real implementation, this could use an LLM for question decomposition
  // For the prototype, we'll use a simple algorithm
  
  // Remove question marks and split by "and", "or", commas
  const cleanQuestion = question.replace(/\?/g, '').trim();
  
  // Look for keywords that might indicate a compound question
  const conjunctions = ['and', 'or', 'versus', 'vs', 'compared to', 'differences between'];
  let hasConjunction = false;
  
  for (const conj of conjunctions) {
    if (cleanQuestion.toLowerCase().includes(conj)) {
      hasConjunction = true;
      break;
    }
  }
  
  // If the question contains conjunctions, break it down
  if (hasConjunction) {
    // Simple heuristic for breaking down the question
    // In a real implementation, this would be more sophisticated
    const parts = cleanQuestion.split(/\s+(?:and|or|versus|vs|compared to)\s+/i);
    
    if (parts.length > 1) {
      // Form sub-questions based on parts
      return parts.map(part => `${part.trim()}?`);
    }
  }
  
  // If we couldn't break it down by conjunctions, create sub-questions by key aspects
  // This is a simplified version, a real implementation would need a more complex algorithm
  const aspects = [
    'what is', 'how does', 'why is', 'when was', 'where is',
    'definition', 'history', 'examples', 'advantages', 'disadvantages'
  ];
  
  const subQuestions = [];
  
  // Add the main question
  subQuestions.push(question);
  
  // Add sub-questions by aspects
  const mainTopic = extractMainTopic(cleanQuestion);
  if (mainTopic) {
    // Add several sub-questions on different aspects
    subQuestions.push(`What is ${mainTopic}?`);
    subQuestions.push(`What are the key features of ${mainTopic}?`);
    subQuestions.push(`What are the applications of ${mainTopic}?`);
  }
  
  // Remove duplicates and return unique sub-questions
  return Array.from(new Set(subQuestions));
}

/**
 * Extracts the main topic from a question
 * @param question The question
 * @returns The main topic or null if it couldn't be determined
 */
function extractMainTopic(question: string): string | null {
  // Remove question words at the beginning
  const withoutQuestionWords = question
    .replace(/^(what|who|when|where|why|how|is|are|do|does|did|can|could|would|should|will)\s+/i, '')
    .trim();
  
  // If the question starts with "the", "a", "an", remove the article
  const withoutArticles = withoutQuestionWords
    .replace(/^(the|a|an)\s+/i, '')
    .trim();
  
  // If there's anything left, return it as the main topic
  return withoutArticles.length > 0 ? withoutArticles : null;
} 