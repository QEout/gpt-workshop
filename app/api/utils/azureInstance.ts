import { createAzure } from '@ai-sdk/azure';
import { AzureOpenAI } from 'openai';
const azureProvider = createAzure();

export const runtime = 'edge';
export const maxDuration = 30;

const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_API_KEY,
  endpoint: process.env.AZURE_BASE_URL,
  apiVersion: process.env.AZURE_API_VERSION,
});

export { azureProvider, azureOpenAI };
