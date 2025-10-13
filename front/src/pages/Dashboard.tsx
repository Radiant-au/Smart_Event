import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Plus, Ticket, Scan } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/api/auth-api';
import { getBatchesByEventId } from '@/api/batch-api';
import { getTicketCountByBatchId } from '@/api/ticket-api';

const Dashboard = () => {
  const [me, setMe] = useState<
    | null
    | {
        id: number;
        name: string;
        email: string;
        createdAt: string;
        updatedAt: string;
        events: Array<{
          id: number;
          name: string;
          code: string;
          description: string | null;
          startDate: string | null;
          endDate: string | null;
          location: string | null;
          createdAt: string;
        }>;
      }
  >(null);

  const userEvents = me?.events ?? [];
  const [totalBatchesRemote, setTotalBatchesRemote] = useState(0);
  const [totalTicketsRemote, setTotalTicketsRemote] = useState(0);
  const [usedTicketsRemote, setUsedTicketsRemote] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('code_jwt');
    if (!token) return;

    const fetchMe = async () => {
      try {
        const res = await getCurrentUser();
        setMe((res as any).data?.data ?? res.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchMe();
  }, []);

  useEffect(() => {
    const fetchTotals = async () => {
      if (!userEvents || userEvents.length === 0) {
        setTotalBatchesRemote(0);
        setTotalTicketsRemote(0);
        setUsedTicketsRemote(0);
        return;
      }

      try {
        const batchesPerEvent = await Promise.all(
          userEvents.map((e) => getBatchesByEventId(e.id))
        );

        const batchLists = batchesPerEvent.map((res: any) => (res.data?.data ?? res.data) || []);
        const allBatches = batchLists.flat();

        setTotalBatchesRemote(allBatches.length);

        const counts = await Promise.all(
          allBatches.map((b: any) =>
            getTicketCountByBatchId(b.id)
              .then((res: any) => (res.data?.data ?? res.data))
              .catch(() => ({ total: 0, used: 0 }))
          )
        );

        const totals = counts.reduce(
          (acc: { total: number; used: number }, c: any) => {
            return { total: acc.total + (c.total || 0), used: acc.used + (c.used || 0) };
          },
          { total: 0, used: 0 }
        );

        setTotalTicketsRemote(totals.total);
        setUsedTicketsRemote(totals.used);
      } catch (e) {
        setTotalBatchesRemote(0);
        setTotalTicketsRemote(0);
        setUsedTicketsRemote(0);
      }
    };

    fetchTotals();
  }, [userEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {me?.name || 'User'}!
            </h1>
            <p className="text-blue-100 text-lg">
              Manage your events and tickets from your dashboard
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:shadow-xl transition-shadow bg-white/60 dark:bg-gray-900/60 backdrop-blur">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userEvents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active events
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:shadow-xl transition-shadow bg-white/60 dark:bg-gray-900/60 backdrop-blur">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ticket Batches
              </CardTitle>
              <Ticket className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBatchesRemote}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total batches
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:shadow-xl transition-shadow bg-white/60 dark:bg-gray-900/60 backdrop-blur">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tickets
              </CardTitle>
              <Ticket className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTicketsRemote}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Generated tickets
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:shadow-xl transition-shadow bg-white/60 dark:bg-gray-900/60 backdrop-blur">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tickets Used
              </CardTitle>
              <Scan className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{usedTicketsRemote}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Scanned tickets
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:shadow-xl transition-shadow bg-white/60 dark:bg-gray-900/60 backdrop-blur">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/events/create">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
              </Link>
              <Link to="/events">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Events
                </Button>
              </Link>
              <Link to="/scan">
                <Button className="w-full justify-start" variant="outline">
                  <Scan className="mr-2 h-4 w-4" />
                  Scan Tickets
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:shadow-xl transition-shadow bg-white/60 dark:bg-gray-900/60 backdrop-blur">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
            <CardHeader className="pb-3">
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Your recently created events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No events yet</p>
                  <Link to="/events/create">
                    <Button className="mt-4" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}/batches`}
                      className="block"
                    >
                      <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            const dateStr = event.startDate || event.createdAt;
                            try {
                              return new Date(dateStr).toLocaleDateString();
                            } catch {
                              return '';
                            }
                          })()} {event.location ? `• ${event.location}` : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
