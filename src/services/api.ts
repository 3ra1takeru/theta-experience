import { Event, Registration, Feedback, InstructorProfile } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycbxuUnhUnr1zfeIzfsYg_KR2eem7Rxy7-Y1lTcJz6SR8bQqIq7H6YYFR62TjLkzGnVS1/exec';

// Helper to call GAS API
async function callApi<T>(action: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
  const url = new URL(API_URL);
  url.searchParams.append('action', action);

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // GAS handles simple requests best with text/plain
    },
  };

  if (method === 'POST' && body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export const api = {
  // --- Events ---
  getEvents: async (): Promise<Event[]> => {
    return callApi<Event[]>('getEvents');
  },

  createEvent: async (event: Omit<Event, 'id'>): Promise<Event> => {
    return callApi<Event>('createEvent', 'POST', event);
  },

  updateEventStatus: async (id: string, status: Event['status']): Promise<void> => {
    await callApi('updateEventStatus', 'POST', { id, status });
  },

  deleteEvent: async (id: string): Promise<void> => {
    await callApi('deleteEvent', 'POST', { id });
  },

  // --- Registrations ---
  getRegistrations: async (): Promise<Registration[]> => {
    return callApi<Registration[]>('getRegistrations');
  },

  createRegistration: async (reg: Omit<Registration, 'id' | 'registeredAt' | 'surveySent' | 'status'>): Promise<Registration> => {
    return callApi<Registration>('createRegistration', 'POST', reg);
  },

  importRegistrations: async (regs: Omit<Registration, 'id' | 'surveySent'>[]): Promise<void> => {
    // Not directly supported in simple CRUD, implement loop or bulk API if needed.
    // For now, sequentially or skip if not critical.
    // Assuming backend support or client-side loop
    for (const r of regs) {
      await callApi('createRegistration', 'POST', r);
    }
  },

  // --- Emails ---
  sendSurveyEmail: async (eventId: string): Promise<number> => {
    // This logic was "mocked" to just update a flag locally.
    // Ideally GAS should handle this.
    // For now, we don't have a "sendSurvey" endpoint in GAS yet.
    // We can just simulate success or add it to GAS.
    // Let's omit or return 0 to warn user, or implement a dummy 'updateRegistrationStatus' loop.
    console.warn("Email sending not fully implemented in GAS backend yet.");
    return 0;
  },

  // --- Feedback ---
  getFeedback: async (onlyApproved = false): Promise<Feedback[]> => {
    const all = await callApi<Feedback[]>('getFeedback');
    return onlyApproved ? all.filter(f => f.isApproved) : all;
  },

  submitFeedback: async (feedback: Omit<Feedback, 'id' | 'isApproved' | 'createdAt'>): Promise<Feedback> => {
    return callApi<Feedback>('submitFeedback', 'POST', feedback);
  },

  approveFeedback: async (id: string): Promise<void> => {
    await callApi('approveFeedback', 'POST', { id });
  },

  unapproveFeedback: async (id: string): Promise<void> => {
    await callApi('unapproveFeedback', 'POST', { id });
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await callApi('deleteFeedback', 'POST', { id });
  },

  // --- Instructor Profile ---
  getInstructorProfile: async (): Promise<InstructorProfile> => {
    return callApi<InstructorProfile>('getInstructor');
  },

  updateInstructorProfile: async (profile: InstructorProfile): Promise<InstructorProfile> => {
    return callApi<InstructorProfile>('updateInstructor', 'POST', profile);
  },

  // --- Google Calendar (GAS) ---
  // Since the backend IS GAS now, these helpers are redundant or implicitly handled.
  getGasUrl: async (): Promise<string> => {
    return API_URL;
  },

  saveGasUrl: async (url: string): Promise<void> => {
    // No-op
  },

  importEvents: async (events: Omit<Event, 'id'>[]): Promise<void> => {
    for (const e of events) {
      await callApi('createEvent', 'POST', e);
    }
  },

  importFeedback: async (feedbacks: Omit<Feedback, 'id' | 'isApproved' | 'createdAt'>[]): Promise<void> => {
    for (const f of feedbacks) {
      await callApi('submitFeedback', 'POST', f);
    }
  }
};