import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, MapPin, Plus, Ticket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '@/api/auth-api';
import { addCollaborator, removeCollaborator } from '@/api/event-api';
import { Input } from '@/components/ui/input';

const EventsList = () => {
  const [events, setEvents] = useState<Array<{
    id: number;
    name: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    location?: string | null;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [collabInput, setCollabInput] = useState<Record<number, string>>({}); // eventId -> userId string

  const load = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser();
      const me = (res as any).data?.data ?? res.data;
      setEvents(me.events ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">
              Manage all your events in one place
            </p>
          </div>
          <Link to="/events/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Loading events...</h3>
              <p className="text-muted-foreground">Please wait</p>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first event
              </p>
              <Link to="/events/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-1">{event.name}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(event.startDate || event.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        // time may not be set
                      })}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location || '—'}
                    </div>
                  </div>
                  <Link to={`/events/${event.id}/batches`}>
                    <Button className="w-full my-4" variant="outline">
                      <Ticket className="mr-2 h-4 w-4" />
                      Manage Ticket Batches
                    </Button>
                  </Link>

                  <div className="border-t pt-4 space-y-2">
                    <div className="text-sm font-medium">Collaborators</div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="User ID"
                        value={collabInput[event.id] || ''}
                        onChange={(e) =>
                          setCollabInput((s) => ({ ...s, [event.id]: e.target.value }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          const userId = Number(collabInput[event.id]);
                          if (!userId) return;
                          await addCollaborator(userId, event.id);
                          setCollabInput((s) => ({ ...s, [event.id]: '' }));
                          await load();
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          const userId = Number(collabInput[event.id]);
                          if (!userId) return;
                          await removeCollaborator(userId, event.id);
                          setCollabInput((s) => ({ ...s, [event.id]: '' }));
                          await load();
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
