import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Calendar, MapPin, Plus, Ticket, Users, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/api/auth-api";
import {
  addCollaborator,
  removeCollaborator,
  getCollaborators,
} from "@/api/event-api";
import { Input } from "@/components/ui/input";

const EventsList = () => {
  const [events, setEvents] = useState<
    Array<{
      id: number;
      name: string;
      description?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      location?: string | null;
      createdAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [collabInput, setCollabInput] = useState<Record<number, string>>({});
  const [collaborators, setCollaborators] = useState<
    Record<number, Array<{ id: number; name: string; email: string }>>
  >({});

  const load = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser();
      const me = (res as any).data?.data ?? res.data;
      const eventsList = me.events ?? [];
      setEvents(eventsList);

      // Fetch collaborators for each event
      const entries = await Promise.all(
        eventsList.map(async (ev: { id: number }) => {
          try {
            const resp = await getCollaborators(ev.id);
            const data = (resp as any).data?.data ?? resp.data;
            return [ev.id, Array.isArray(data) ? data : []] as const;
          } catch {
            return [ev.id, []] as const;
          }
        })
      );
      setCollaborators(Object.fromEntries(entries));
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
            <h1 className="text-4xl font-bold mb-2">My Card Groups</h1>
            <p className="text-muted-foreground">
              Manage all your groups in one place
            </p>
          </div>
          <Link to="/events/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
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
                  Create Your First Card
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:shadow-xl transition-shadow bg-white/60 dark:bg-gray-900/60 backdrop-blur"
              >
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
                <CardHeader className="pb-3">
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
                      {new Date(
                        event.startDate || event.createdAt
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location || "—"}
                    </div>
                  </div>

                  <Link to={`/events/${event.id}/batches`}>
                    <Button className="w-full my-4" variant="outline">
                      <Ticket className="mr-2 h-4 w-4" />
                      Manage Card Batches
                    </Button>
                  </Link>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4 text-indigo-500" />
                        Collaborators
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {collaborators[event.id]?.length ?? 0} member(s)
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="User Email"
                        type="email"
                        value={collabInput[event.id] || ""}
                        onChange={(e) =>
                          setCollabInput((s) => ({
                            ...s,
                            [event.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          const email = (collabInput[event.id] || "").trim();
                          if (!email) return;
                          await addCollaborator(email, event.id);
                          setCollabInput((s) => ({ ...s, [event.id]: "" }));
                          await load();
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    <div>
                      {collaborators[event.id]?.length > 0 ? (
                        <div className="flex flex-col gap-2 mt-2 w-full">
                          {collaborators[event.id].map((c) => {
                            const initials =
                              (c.name || "")
                                .split(" ")
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase() || "U";
                            return (
                              <div
                                key={`${event.id}-${c.id}`}
                                className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gradient-to-br from-white/70 to-gray-50/50 dark:from-gray-900/50 dark:to-gray-900/30 shadow-sm hover:shadow-md transition-all w-full"
                              >
                                <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold ring-2 ring-white dark:ring-gray-900">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium leading-5 truncate">
                                    {c.name}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="truncate">{c.email}</span>
                                  </div>
                                </div>

                                <div className="ml-auto flex gap-2">
                                  {/* View Button navigates to scanned tickets page */}
                                  <Link
                                    to={`/batches/${c.id}/scanned-tickets`}
                                    state={{ collaboratorName: c.name }}
                                  >
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="h-7 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                                      title="View scanned cards"
                                    >
                                      View
                                    </Button>
                                  </Link>

                                  {/* Remove Button */}
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                                    onClick={async () => {
                                      await removeCollaborator(c.id, event.id);
                                      setCollaborators((prev) => ({
                                        ...prev,
                                        [event.id]: (
                                          prev[event.id] || []
                                        ).filter((x) => x.id !== c.id),
                                      }));
                                    }}
                                    title="Remove collaborator"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-muted-foreground">
                          No collaborators
                        </div>
                      )}
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
