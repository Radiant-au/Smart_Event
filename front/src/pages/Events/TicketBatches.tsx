import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Ticket, Download, Eye } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { useToast } from '../../hooks/use-toast';
import { downloadTicketsAsZip } from '../../utils/downloadZip';

const TicketBatches = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    getEventById,
    getBatchesByEvent,
    createBatch,
    generateTickets,
    getTicketsByBatch,
  } = useAppStore();

  const event = eventId ? getEventById(Number(eventId)) : null;
  const batches = eventId ? getBatchesByEvent(Number(eventId)) : [];

  const [batchName, setBatchName] = useState('');
  const [price, setPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Event not found</p>
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

    setTimeout(() => {
      try {
        createBatch({
          eventId: event.id,
          name: batchName,
          price: parseFloat(price),
          totalTickets: parseInt(totalTickets),
        });

        toast({
          title: 'Batch created',
          description: 'Ticket batch has been created successfully',
        });

        setBatchName('');
        setPrice('');
        setTotalTickets('');
        setIsDialogOpen(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create batch',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleGenerateTickets = async (batchId: number, batchName: string, count: number) => {
    setLoading(true);

    setTimeout(() => {
      try {
        generateTickets(batchId, event.id, batchName, count);
        toast({
          title: 'Tickets generated',
          description: `${count} tickets have been generated successfully`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to generate tickets',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleDownloadZip = async (batchId: number, batchName: string) => {
    const tickets = getTicketsByBatch(batchId);

    if (tickets.length === 0) {
      toast({
        title: 'No tickets',
        description: 'Generate tickets first before downloading',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await downloadTicketsAsZip(tickets, batchName);
      toast({
        title: 'ZIP download successful',
        description: `Downloaded ${tickets.length} barcodes`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate ZIP file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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

        <div className="flex justify-end mb-6">
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
                  <Label htmlFor="batchName">Batch Name</Label>
                  <Input
                    id="batchName"
                    placeholder="e.g., VIP, General Admission"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    required
                  />
                </div>
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
              const tickets = getTicketsByBatch(batch.id);
              const generated = tickets.length;

              return (
                <Card key={batch.id}>
                  <CardHeader>
                    <CardTitle>{batch.name}</CardTitle>
                    <CardDescription>
                      ${batch.price.toFixed(2)} per ticket
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Total: {batch.totalTickets} tickets</div>
                      <div>Generated: {generated} tickets</div>
                      <div>Remaining: {batch.totalTickets - generated}</div>
                    </div>

                    {generated < batch.totalTickets && (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() =>
                          handleGenerateTickets(
                            batch.id,
                            batch.name,
                            batch.totalTickets - generated
                          )
                        }
                        disabled={loading}
                      >
                        <Ticket className="mr-2 h-4 w-4" />
                        Generate Tickets
                      </Button>
                    )}

                    {generated > 0 && (
                      <>
                        <Link to={`/batches/${batch.id}/tickets`}>
                          <Button className="w-full" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Tickets
                          </Button>
                        </Link>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleDownloadZip(batch.id, batch.name)}
                          disabled={loading}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download ZIP
                        </Button>
                      </>
                    )}
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
