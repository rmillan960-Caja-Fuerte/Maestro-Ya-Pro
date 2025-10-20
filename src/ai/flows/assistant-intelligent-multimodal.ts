'use server';

/**
 * @fileOverview An intelligent multimodal assistant flow.
 *
 * - assistantIntelligentMultimodal - A function that handles the intelligent multimodal assistant process.
 * - AssistantIntelligentMultimodalInput - The input type for the assistantIntelligentMultimodal function.
 * - AssistantIntelligentMultimodalOutput - The return type for the assistantIntelligentMultimodal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantIntelligentMultimodalInputSchema = z.object({
  query: z.string().describe('The user query, can be text, voice or image.'),
});
export type AssistantIntelligentMultimodalInput = z.infer<
  typeof AssistantIntelligentMultimodalInputSchema
>;

const AssistantIntelligentMultimodalOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant.'),
});
export type AssistantIntelligentMultimodalOutput = z.infer<
  typeof AssistantIntelligentMultimodalOutputSchema
>;

export async function assistantIntelligentMultimodal(
  input: AssistantIntelligentMultimodalInput
): Promise<AssistantIntelligentMultimodalOutput> {
  return assistantIntelligentMultimodalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistantIntelligentMultimodalPrompt',
  input: {schema: AssistantIntelligentMultimodalInputSchema},
  output: {schema: AssistantIntelligentMultimodalOutputSchema},
  prompt: `You are an intelligent multimodal assistant that can receive text, voice and image input.

You are available in a floating sidebar in every app page.

You can answer general questions like 'What master has the best performance this month'.
You can also execute tasks such as 'Create a quote for María de pintura de 3 habitaciones'.

You can provide proactive suggestions like 'You have 3 quotes without follow up more than 5 days ago'.

You act as an assistant to help users use the application features and surface useful insights.

Here is the user query: {{{query}}}`,
});

const assistantIntelligentMultimodalFlow = ai.defineFlow(
  {
    name: 'assistantIntelligentMultimodalFlow',
    inputSchema: AssistantIntelligentMultimodalInputSchema,
    outputSchema: AssistantIntelligentMultimodalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
