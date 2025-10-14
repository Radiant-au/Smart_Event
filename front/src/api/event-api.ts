import apiClient from "@/api/api-client";

/**
 * =====================
 *  Event Types (DTO/Entity)
 * =====================
 */
export interface EventDto {
  name: string;
  description?: string;
  userId: number;
  // Optional fields if you later allow them from the frontend
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  location?: string;
}

export interface EventEntity {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  startDate?: string | null; // serialized by API
  endDate?: string | null;
  location?: string | null;
  createdAt: string; // ISO string
  // Keeping these loose for now; extend as needed
  creator?: { id: number; name?: string; email?: string };
  collaborators?: Array<{ id: number; name?: string; email?: string }>;
}

export interface CollaboratorDto {
  id: number;
  name: string;
  email: string;
}

/**
 * =====================
 *  Event API Calls
 * =====================
 */

// Create a new event
export const createEvent = async (data: EventDto) => {
  // POST /events/
  const response = await apiClient.post("/event", data);
  return response; // { success: true, data: EventEntity }
};

// Add a collaborator to an event
export const addCollaborator = async (email: string, eventId: number) => {
  // POST /event/add/:event  with { email } in body
  const response = await apiClient.post(`/event/add/${eventId}`, { email });
  return response; // { success: true, data: EventEntity }
};

// Remove a collaborator from an event
export const removeCollaborator = async (userId: number, eventId: number) => {
  // POST /events/remove/:user/:event
  const response = await apiClient.post(`/event/remove/${userId}/${eventId}`);
  return response; // { success: true, data: EventEntity }
};

// Get collaborators for an event (name and email)
export const getCollaborators = async (eventId: number) => {
  const response = await apiClient.get(`/event/collaborators/${eventId}`);
  // Expecting { success: true, data: CollaboratorDto[] }
  return response;
};
