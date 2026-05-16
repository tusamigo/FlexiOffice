
'use server';
/**
 * @fileOverview A Genkit flow that provides personalized recommendations to an employee
 * on whether to work from home or in the office for upcoming days.
 * 
 * Integrated with tools to fetch data from External Calendars and HR Systems.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorkspaceAdvisorInputSchema = z.object({
  employeeId: z.string().describe('The ID of the employee requesting the recommendation.'),
  recommendationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The date for which the recommendation is requested (YYYY-MM-DD).'),
  teamMeetings: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().regex(/^\d{2}:\d{2}$/),
      title: z.string(),
      attendees: z.array(z.string()).describe('List of attendee employee IDs.'),
      locationType: z.enum(['Office', 'Remote', 'Hybrid']).describe('The location type of the meeting.'),
      purpose: z.string().describe('The purpose or topic of the meeting.'),
    })
  ).describe('A list of scheduled team meetings for the upcoming days.'),
  teamOfficePresence: z.array(
    z.object({
      employeeId: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(['InOffice', 'WFH']),
    })
  ).describe('A list of planned office presence for team members.'),
  employeeCommuteDistanceKm: z.number().positive().describe('The employee\'s one-way commute distance in kilometers.'),
});
export type WorkspaceAdvisorInput = z.infer<typeof WorkspaceAdvisorInputSchema>;

const WorkspaceAdvisorOutputSchema = z.object({
  recommendation: z.enum(['WFH', 'InOffice']).describe('The AI\'s recommendation.'),
  reasoning: z.string().describe('Detailed explanation.'),
  externalFactors: z.array(z.string()).describe('Factors from external systems like Calendar or HRIS.').optional(),
  collaborationImpact: z.object({
    inOfficeMeetings: z.array(z.string()).optional(),
    teamMembersInOffice: z.array(z.string()).optional(),
    potentialCollaborationGain: z.string().optional(),
  }).optional(),
  sustainabilityImpact: z.object({
    co2SavedKg: z.number().optional(),
    commuteTimeSavedMinutes: z.number().optional(),
    sustainabilityMessage: z.string().optional(),
  }).optional(),
  smartNudge: z.string().describe('Actionable nudge.'),
});
export type WorkspaceAdvisorOutput = z.infer<typeof WorkspaceAdvisorOutputSchema>;

// Tool: Fetch External Calendar Data (Google/Outlook)
const getExternalCalendarMeetings = ai.defineTool(
  {
    name: 'getExternalCalendarMeetings',
    description: 'Fetches meetings from the user\'s external Google or Outlook calendar for a specific date.',
    inputSchema: z.object({
      employeeId: z.string(),
      date: z.string(),
    }),
    outputSchema: z.array(z.object({
      title: z.string(),
      isPrivate: z.boolean(),
      durationMin: z.number()
    })),
  },
  async (input) => {
    // Simulated external API call
    return [
      { title: "Doctor Appointment", isPrivate: true, durationMin: 60 },
      { title: "Deep Focus Session", isPrivate: false, durationMin: 120 }
    ];
  }
);

// Tool: Fetch HRIS Leave/Org Data
const getEmployeeHRData = ai.defineTool(
  {
    name: 'getEmployeeHRData',
    description: 'Fetches leave schedules or organization changes from HRIS systems like Workday.',
    inputSchema: z.object({
      employeeId: z.string(),
    }),
    outputSchema: z.object({
      onLeave: z.boolean(),
      upcomingHolidays: z.array(z.string())
    }),
  },
  async (input) => {
    return {
      onLeave: false,
      upcomingHolidays: ["Friday - Company Day Off"]
    };
  }
);

const workspaceAdvisorPrompt = ai.definePrompt({
  name: 'workspaceAdvisorRecommendationPrompt',
  tools: [getExternalCalendarMeetings, getEmployeeHRData],
  input: { schema: WorkspaceAdvisorInputSchema.extend({
      estimatedCo2SavedKg: z.number().optional(),
      estimatedCommuteTimeSavedMinutes: z.number().optional(),
    })
  },
  output: { schema: WorkspaceAdvisorOutputSchema },
  prompt: `You are an AI Workspace Advisor. Use the provided tools if the employee has external integrations enabled.
  
  Consider the following:
  - Internal Meetings: {{teamMeetings}}
  - Team Presence: {{teamOfficePresence}}
  - Commute: {{employeeCommuteDistanceKm}}km
  
  If there are external calendar conflicts or HR holidays, adjust your recommendation.
  Prioritize InOffice for high-collaboration hybrid meetings.
  Prioritize WFH for focus work or if sustainability gain is high.
  
  Current Date: {{recommendationDate}}
  Employee: {{employeeId}}`,
});

export async function workspaceAdvisorRecommendation(
  input: WorkspaceAdvisorInput
): Promise<WorkspaceAdvisorOutput> {
  return workspaceAdvisorRecommendationFlow(input);
}

const workspaceAdvisorRecommendationFlow = ai.defineFlow(
  {
    name: 'workspaceAdvisorRecommendationFlow',
    inputSchema: WorkspaceAdvisorInputSchema,
    outputSchema: WorkspaceAdvisorOutputSchema,
  },
  async (input) => {
    const { output } = await workspaceAdvisorPrompt({
      ...input,
      estimatedCo2SavedKg: parseFloat((input.employeeCommuteDistanceKm * 0.4).toFixed(2)),
      estimatedCommuteTimeSavedMinutes: Math.round((input.employeeCommuteDistanceKm * 2 / 40) * 60),
    });
    return output!;
  }
);
