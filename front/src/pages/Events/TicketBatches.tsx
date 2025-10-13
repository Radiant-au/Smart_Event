import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Ticket, Eye, AppWindow } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useEffect } from 'react';
import { getCurrentUser } from '@/api/auth-api';
import { createTicketBatch, createDynamicTicketBatch, getBatchesByEventId } from '@/api/batch-api';
import { getTicketCountByBatchId } from '@/api/ticket-api';
const TicketBatches = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Using API directly; no local store for batches/tickets

  const [event, setEvent] = useState<
    | null
    | {
        id: number;
        name: string;
        description?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        location?: string | null;
        createdAt: string;
      }
  >(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!eventId) return;
      try {
        setLoadingEvent(true);
        const res = await getCurrentUser();
        const me = (res as any).data?.data ?? res.data;
        const found = (me.events || []).find((e: any) => e.id === Number(eventId));
        setEvent(found || null);
      } finally {
        setLoadingEvent(false);
      }
    };
    load();
  }, [eventId]);
  const [remoteBatches, setRemoteBatches] = useState<any[]>([]);
  const batches = remoteBatches;
  const [batchCounts, setBatchCounts] = useState<Record<number, { total: number; used: number; unused: number }>>({});

  const fetchBatches = async (eid: number) => {
    try {
      const res = await getBatchesByEventId(eid);
      const data = (res as any).data?.data ?? res.data;
      setRemoteBatches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchBatches(Number(eventId));
    }
  }, [eventId]);

  useEffect(() => {
    const loadCounts = async () => {
      const entries = await Promise.all(
        batches.map(async (b: any) => {
          try {
            const res = await getTicketCountByBatchId(b.id);
            const data = (res as any).data?.data ?? res.data?.data ?? res.data;
            return [b.id, { total: data.total, used: data.used, unused: data.unused }] as const;
          } catch (e) {
            return [b.id, { total: 0, used: 0, unused: 0 }] as const;
          }
        })
      );
      setBatchCounts(Object.fromEntries(entries));
    };
    if (batches.length > 0) {
      loadCounts();
    }
  }, [batches]);

  const [batchName, setBatchName] = useState('');
  const [price, setPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [batchType, setBatchType] = useState<'static' | 'dynamic'>('static');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!event || loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">{loadingEvent ? 'Loading event...' : 'Event not found'}</p>
            <Button onClick={() => navigate('/events')}>
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (batchType === 'static') {
        await createTicketBatch(event.id, {
          name: batchName,
          price: price, // backend accepts string
          ticket: parseInt(totalTickets),
        });
      } else {
        await createDynamicTicketBatch(event.id, {
          name: batchName,
          ticket: parseInt(totalTickets),
        });
        // Not updating local store for dynamic since store schema requires totalTickets.
      }

      toast({
        title: 'Batch created',
        description: batchType === 'static' ? 'Static ticket batch created' : 'Dynamic ticket batch created',
      });

      setBatchName('');
      setPrice('');
      setTotalTickets('');
      setBatchType('static');
      setIsDialogOpen(false);

      // Refresh remote list
      fetchBatches(event.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create batch',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoulette = (batch?: any) => {
    const name = batch?.name ? ` for ${batch.name}` : '';
    toast({ title: 'Add roulette', description: `Roulette configuration coming soon${name}` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/events')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          <p className="text-muted-foreground">
            Manage ticket batches for this event
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Add a new ticket batch for this event
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div className="space-y-2">
                  <Label>Batch Type</Label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="batchType"
                        value="static"
                        checked={batchType === 'static'}
                        onChange={() => setBatchType('static')}
                      />
                      Static ticket
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="batchType"
                        value="dynamic"
                        checked={batchType === 'dynamic'}
                        onChange={() => setBatchType('dynamic')}
                      />
                      Dynamic ticket
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchName">Batch Name</Label>
                  <Input
                    id="batchName"
                    placeholder="e.g., VIP, General Admission"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    required
                  />
                </div>
                {batchType === 'static' && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="totalTickets">Total Tickets</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    placeholder="100"
                    value={totalTickets}
                    onChange={(e) => setTotalTickets(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Batch'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {batches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No batches yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first ticket batch to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => {
              const ticketsList = Array.isArray(batch.tickets) ? batch.tickets : [];
              const generated = batchCounts[batch.id]?.total ?? ticketsList.length;
              const isDynamic = Boolean((batch as any).dynamic);
              const price = Number(batch.price ?? 0).toFixed(2);

              return (
                <Card
                  key={batch.id}
                  className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:shadow-xl transition-shadow bg-white/60 dark:bg-gray-900/60 backdrop-blur"
                >
                  <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg font-semibold tracking-tight">{batch.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                            {price}Ks per ticket
                          </span>
                        </CardDescription>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        isDynamic
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}>
                        {isDynamic ? 'Dynamic' : 'Static'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 p-3">
                        <div className="text-gray-500 dark:text-gray-400">Generated</div>
                        <div className="mt-1 text-base font-semibold">{generated}</div>
                      </div>
                      <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 p-3">
                        <div className="text-gray-500 dark:text-gray-400">Used</div>
                        <div className="mt-1 text-base font-semibold">{batchCounts[batch.id]?.used ?? '—'}</div>
                      </div>
                      <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 p-3">
                        <div className="text-gray-500 dark:text-gray-400">Unused</div>
                        <div className="mt-1 text-base font-semibold">{batchCounts[batch.id]?.unused ?? '—'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <Link to={`/batches/${batch.id}/tickets`} className="flex-1">
                        <Button className="w-full" variant="secondary">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/batches/layout/${batch.id}`} className="flex-1">
                        <Button className="w-full" variant='outline' disabled={loading || generated === 0}>
                          <AppWindow className="mr-2 h-4 w-4" />
                          Design Ticket
                        </Button>
                      </Link>
                      {isDynamic && (
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => handleAddRoulette(batch)}
                          title="Configure roulette for this batch"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Roulette
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketBatches;
