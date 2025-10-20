'use server';
/**
 * @fileOverview This file defines a Genkit flow for AI-powered quote generation.
 *
 * It allows users to generate automated work order and project quotes for clients by uploading customer messages or photos.
 * The tool analyzes the files, extracts key information, creates new profiles if the client doesn't already exist,
 * and provides automated catalog suggestions.
 *
 * - generateQuote - A function that handles the quote generation process.
 * - GenerateQuoteInput - The input type for the generateQuote function.
 * - GenerateQuoteOutput - The return type for the generateQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuoteInputSchema = z.object({
  customerMessage: z.string().optional().describe('Customer message describing the service request.'),
  photoDataUri: z.string().optional().describe(
    "A photo related to the service request, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type GenerateQuoteInput = z.infer<typeof GenerateQuoteInputSchema>;

const GenerateQuoteOutputSchema = z.object({
  serviceType: z.string().describe('The type of service requested.'),
  location: z.string().describe('The location where the service is needed.'),
  urgency: z.string().describe('The urgency of the service request.'),
  requirements: z.string().describe('The specific requirements for the service.'),
  existingClient: z.boolean().describe('Whether the client already exists in the database.'),
  suggestedCatalogItems: z.array(z.string()).describe('A list of suggested catalog items based on the service request.'),
  calculatedPrice: z.number().describe('The calculated price for the service based on historical data, market conditions, and complexity.'),
  assignedMaster: z.string().describe('The ID of the optimal master assigned to the service request.'),
  generatedDescription: z.string().describe('A professionally written description of the service to be performed.'),
});
export type GenerateQuoteOutput = z.infer<typeof GenerateQuoteOutputSchema>;

export async function generateQuote(input: GenerateQuoteInput): Promise<GenerateQuoteOutput> {
  return generateQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuotePrompt',
  input: {schema: GenerateQuoteInputSchema},
  output: {schema: GenerateQuoteOutputSchema},
  prompt: `You are an AI assistant designed to generate work order quotes based on customer input.

  Analyze the provided customer message and/or photo to extract key information such as:
  - The type of service requested
  - The location where the service is needed
  - The urgency of the service request
  - Any specific requirements for the service

  If a photo is provided, use it to identify relevant details about the service request.

  Based on the extracted information, determine if the client already exists in the database.

  Suggest a list of catalog items that are relevant to the service request.

  Calculate an appropriate price for the service, taking into account historical data, market conditions, and the complexity of the request.

  Assign an optimal master to the service request based on their expertise, availability, and location.

  Generate a professionally written description of the service to be performed.

  Customer Message: {{{customerMessage}}}
  Photo: {{#if photoDataUri}}{{media url=photoDataUri}}{{/if}}

  Ensure that the output is a valid JSON object conforming to the following schema:
  ${JSON.stringify(GenerateQuoteOutputSchema.describe())}`,
});

const generateQuoteFlow = ai.defineFlow(
  {
    name: 'generateQuoteFlow',
    inputSchema: GenerateQuoteInputSchema,
    outputSchema: GenerateQuoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

