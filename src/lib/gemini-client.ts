import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const DEFAULT_MODEL = "gemini-2.0-flash-exp";
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.7;

// Simple rate limiting
let requestCount = 0;
let resetTime = Date.now() + 60000; // Reset every minute
const MAX_REQUESTS_PER_MINUTE = 10; // Conservative limit (free tier is 15)

function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Reset counter every minute
  if (now > resetTime) {
    requestCount = 0;
    resetTime = now + 60000;
  }
  
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    return false; // Rate limit exceeded
  }
  
  requestCount++;
  return true;
}

export interface GeminiGenerationConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GeminiResponse {
  text: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
}

/**
 * Generate a response from Gemini AI
 * @param prompt - The prompt to send to Gemini
 * @param config - Optional configuration for the generation
 * @returns The generated response
 */
export async function generateResponse(
  prompt: string,
  config?: GeminiGenerationConfig,
): Promise<GeminiResponse> {
  try {
    // Check rate limit before making request
    if (!checkRateLimit()) {
      throw new Error("Rate limit exceeded. Please wait before making more requests.");
    }

    const modelName = config?.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: config?.maxTokens || DEFAULT_MAX_TOKENS,
        temperature: config?.temperature || DEFAULT_TEMPERATURE,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract token usage if available
    const usage = response.usageMetadata;
    const tokensUsed = usage
      ? {
          input: usage.promptTokenCount || 0,
          output: usage.candidatesTokenCount || 0,
        }
      : undefined;

    return {
      text,
      tokensUsed,
    };
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    throw new Error(
      `Failed to generate AI response: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Generate a streaming response from Gemini AI (for future implementation)
 * @param prompt - The prompt to send to Gemini
 * @param config - Optional configuration for the generation
 * @returns An async generator that yields response chunks
 */
export async function* generateStreamingResponse(
  prompt: string,
  config?: GeminiGenerationConfig,
): AsyncGenerator<string, void, unknown> {
  try {
    const modelName = config?.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: config?.maxTokens || DEFAULT_MAX_TOKENS,
        temperature: config?.temperature || DEFAULT_TEMPERATURE,
      },
    });

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error generating streaming Gemini response:", error);
    throw new Error(
      `Failed to generate streaming AI response: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Check if the Gemini API is properly configured
 * @returns true if the API key is set, false otherwise
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GOOGLE_GEMINI_API_KEY;
}

/**
 * Test the Gemini API connection
 * @returns true if the connection is successful
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const response = await generateResponse("Say 'OK' if you can hear me.");
    return response.text.length > 0;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}
