import axios from './axiosConfig';

/**
 * Converts Gemini markdown to readable plain text
 * @param {string} markdown - The markdown string to convert
 * @returns {string} Plain text version
 */
function geminiMarkdownToPlainText(markdown) {
  if (!markdown || typeof markdown !== 'string') return '';
  
  const transformations = [
    [/\*\*([^*]+)\*\*/g, '$1'],        // Remove bold
    [/\*([^*]+)\*/g, '$1'],            // Remove italic
    [/`([^`]+)`/g, '$1'],              // Remove inline code
    [/^#+\s?/gm, ''],                  // Remove headings
    [/^---+$/gm, ''],                  // Remove horizontal rules
    [/^\s*[-*]\s?/gm, ''],             // Remove list markers
    [/^\s*\d+\.\s?/gm, ''],            // Remove numbered lists
    [/^>\s?/gm, ''],                   // Remove blockquotes
    [/\n{3,}/g, '\n\n'],               // Remove extra blank lines
    [/Feature Name:/g, '✅ Feature Name:'] // Add checkmarks
  ];
  
  return transformations
    .reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), markdown)
    .trim();
}

/**
 * Safely parses JSON string, returns original on failure
 * @param {string} str - String to parse
 * @returns {any} Parsed object or original string
 */
function safeJsonParse(str) {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

/**
 * Extracts text content from various API response structures
 * @param {any} data - API response data
 * @returns {string} Extracted text content
 */
function extractTextContent(data) {
  // Direct string response
  if (typeof data === 'string') return data;
  
  // Check for text property
  if (data.text) return data.text;
  
  // Navigate nested candidate structures
  const candidates = data.result?.candidates || data.candidates;
  if (Array.isArray(candidates) && candidates[0]) {
    const firstCandidate = candidates[0];
    const parts = firstCandidate.content?.parts;
    if (Array.isArray(parts) && parts[0]?.text) {
      return parts[0].text;
    }
  }
  
  // Fallback to result if it's a string
  if (typeof data.result === 'string') return data.result;
  
  return '';
}

/**
 * Generates a project based on job description
 * @param {string} jobDescription - The job description to process
 * @returns {Promise<string>} Processed plain text result
 */
export const generateProject = async (jobDescription) => {
  try {
    const response = await axios.post('/api/projects/job/submit', { jobDescription });
    
    // Parse response data if it's a JSON string
    const parsedData = safeJsonParse(response.data);
    
    // If result property exists and is a string, try to parse it too
    if (parsedData.result && typeof parsedData.result === 'string') {
      parsedData.result = safeJsonParse(parsedData.result);
    }
    
    // Extract the text content from the response
    const textContent = extractTextContent(parsedData);
    
    // Convert markdown to plain text
    return geminiMarkdownToPlainText(textContent);
    
  } catch (error) {
    console.error('Error generating project:', error);
    throw new Error('Failed to generate project. Please try again.');
  }
};