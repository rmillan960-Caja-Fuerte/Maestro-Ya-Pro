'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a daily summary for the admin.
 *
 * It uses AI to analyze the day's activities, including work orders, quotes, and financial data,
 * to provide a concise and insightful summary.
 *
 * - generateDailySummary - A function that handles the summary generation process.
 * - DailySummaryInput - The input type for the generateDailySummary function.
 * - DailySummaryOutput - The return type for the generateDailySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Mock data for demonstration. In a real app, this would come from a database.
const getTodaysData = () => ({
    newQuotes: 5,
    newWorkOrders: 3,
    completedWorkOrders: 2,
    revenue: 1250.75,
    pendingPayments: 2,
    topPerformer: 'Maestro Juan',
});

const DailySummaryInputSchema = z.object({
  date: z.string().describe('The date for which to generate the summary (e.g., YYYY-MM-DD).'),
});
export type DailySummaryInput = z.infer<typeof DailySummaryInputSchema>;

const DailySummaryOutputSchema = z.object({
  title: z.string().describe('The title of the summary.'),
  keyMetrics: z.array(z.object({
    metric: z.string().describe('Name of the metric.'),
    value: z.string().describe('Value of the metric.'),
    change: z.string().optional().describe('Change from the previous period.'),
  })).describe('Key performance indicators for the day.'),
  highlights: z.array(z.string()).describe('A bullet-point list of important events or insights from the day.'),
  actionItems: z.array(z.string()).describe('A list of suggested actions for the admin.'),
});
export type DailySummaryOutput = z.infer<typeof DailySummaryOutputSchema>;

export async function generateDailySummary(input: DailySummaryInput): Promise<DailySummaryOutput> {
  return dailySummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailySummaryPrompt',
  input: {schema: z.object({
    date: z.string(),
    newQuotes: z.number(),
    newWorkOrders: z.number(),
    completedWorkOrders: z.number(),
    revenue: z.number(),
    pendingPayments: z.number(),
    topPerformer: z.string(),
  })},
  output: {schema: DailySummaryOutputSchema},
  prompt: `You are an expert business analyst for a professional services company.
  Generate a concise daily summary for the administrator for the date {{{date}}}.

  Analyze the following data for the day:
  - New Quotes Created: {{{newQuotes}}}
  - New Work Orders: {{{newWorkOrders}}}
  - Completed Work Orders: {{{completedWorkOrders}}}
  - Total Revenue: {{{revenue}}}
  - Pending Payments: {{{pendingPayments}}}
  - Top Performing Master: {{{topPerformer}}}

  Based on this data, provide:
  1.  A short, engaging title for the summary.
  2.  A list of the most important key metrics.
  3.  A list of highlights and important insights. What went well? Are there any trends?
  4.  A list of actionable suggestions for the admin. For example, following up on quotes, addressing pending payments, or acknowledging the top performer.

  The tone should be professional, clear, and direct.
  Ensure the output is a valid JSON object conforming to the schema.`,
});

const dailySummaryFlow = ai.defineFlow(
  {
    name: 'dailySummaryFlow',
    inputSchema: DailySummaryInputSchema,
    outputSchema: DailySummaryOutputSchema,
  },
  async (input) => {
    // In a real application, you would fetch this data from your database.
    const todaysData = getTodaysData();

    const {output} = await prompt({
        date: input.date,
        ...todaysData,
    });
    return output!;
  }
);
