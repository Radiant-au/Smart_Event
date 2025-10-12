import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  userId: number;
}

export interface TicketBatch {
  id: number;
  eventId: number;
  name: string;
  price: number;
  totalTickets: number;
}

export interface Ticket {
  id: number;
  batchId: number;
  eventId: number;
  barcode_code: string;
  status: 'unused' | 'used';
}

interface AuthData {
  user: User | null;
  token: string | null;
}

interface AppStore {
  auth: AuthData;
  users: Array<User & { password: string }>;
  events: Event[];
  batches: TicketBatch[];
  tickets: Ticket[];

  login: (username: string, password: string) => boolean;
  register: (username: string, password: string, email: string) => boolean;
  logout: () => void;

  createEvent: (event: Omit<Event, 'id' | 'userId'>) => Event;
  getEventsByUser: (userId: number) => Event[];
  getEventById: (id: number) => Event | undefined;

  createBatch: (batch: Omit<TicketBatch, 'id'>) => TicketBatch;
  getBatchesByEvent: (eventId: number) => TicketBatch[];
  getBatchById: (id: number) => TicketBatch | undefined;

  generateTickets: (batchId: number, eventId: number, batchName: string, count: number) => Ticket[];
  getTicketsByBatch: (batchId: number) => Ticket[];
  getTicketByBarcode: (barcode: string) => Ticket | undefined;
  markTicketAsUsed: (ticketId: number) => void;
  scanTicket: (barcode: string) => { valid: boolean; ticket?: Ticket; message: string };
}

const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      auth: {
        user: null,
        token: null,
      },
      users: [],
      events: [],
      batches: [],
      tickets: [],

      login: (username: string, password: string) => {
        const user = get().users.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          set({
            auth: {
              user: { id: user.id, username: user.username, email: user.email },
              token: `mock-token-${user.id}-${Date.now()}`,
            },
          });
          return true;
        }
        return false;
      },

      register: (username: string, password: string, email: string) => {
        const existingUser = get().users.find(
          (u) => u.username === username || u.email === email
        );

        if (existingUser) {
          return false;
        }

        const newUser = {
          id: Date.now(),
          username,
          password,
          email,
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));

        return true;
      },

      logout: () => {
        set({
          auth: {
            user: null,
            token: null,
          },
        });
      },

      createEvent: (event) => {
        const userId = get().auth.user?.id;
        if (!userId) throw new Error('Not authenticated');

        const newEvent: Event = {
          ...event,
          id: Date.now(),
          userId,
        };

        set((state) => ({
          events: [...state.events, newEvent],
        }));

        return newEvent;
      },

      getEventsByUser: (userId) => {
        return get().events.filter((e) => e.userId === userId);
      },

      getEventById: (id) => {
        return get().events.find((e) => e.id === id);
      },

      createBatch: (batch) => {
        const newBatch: TicketBatch = {
          ...batch,
          id: Date.now(),
        };

        set((state) => ({
          batches: [...state.batches, newBatch],
        }));

        return newBatch;
      },

      getBatchesByEvent: (eventId) => {
        return get().batches.filter((b) => b.eventId === eventId);
      },

      getBatchById: (id) => {
        return get().batches.find((b) => b.id === id);
      },

      generateTickets: (batchId, eventId, batchName, count) => {
        const existingTickets = get().tickets.filter((t) => t.batchId === batchId);
        const startNumber = existingTickets.length + 1;

        const newTickets: Ticket[] = [];
        for (let i = 0; i < count; i++) {
          const ticketNumber = (startNumber + i).toString().padStart(4, '0');
          const barcodeCode = `EVT${eventId}-${batchName.toUpperCase().replace(/\s/g, '')}-${ticketNumber}`;

          newTickets.push({
            id: Date.now() + i,
            batchId,
            eventId,
            barcode_code: barcodeCode,
            status: 'unused',
          });
        }

        set((state) => ({
          tickets: [...state.tickets, ...newTickets],
        }));

        return newTickets;
      },

      getTicketsByBatch: (batchId) => {
        return get().tickets.filter((t) => t.batchId === batchId);
      },

      getTicketByBarcode: (barcode) => {
        return get().tickets.find((t) => t.barcode_code === barcode);
      },

      markTicketAsUsed: (ticketId) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, status: 'used' as const } : t
          ),
        }));
      },

      scanTicket: (barcode) => {
        const ticket = get().getTicketByBarcode(barcode);

        if (!ticket) {
          return {
            valid: false,
            message: '❌ Invalid ticket - Barcode not found',
          };
        }

        if (ticket.status === 'used') {
          return {
            valid: false,
            ticket,
            message: '❌ Ticket already used',
          };
        }

        get().markTicketAsUsed(ticket.id);

        return {
          valid: true,
          ticket,
          message: '✅ Valid ticket - Entry granted',
        };
      },
    }),
    {
      name: 'smart-events-storage',
    }
  )
);

export default useAppStore;
