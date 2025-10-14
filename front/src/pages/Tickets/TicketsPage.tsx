import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getTicketsByBatch, TicketSummaryDto } from '@/api/ticket-api';
import Barcode from 'react-barcode';

type FilterMode = 'all' | 'static' | 'dynamic';

const TicketsPage = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<TicketSummaryDto[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');

  useEffect(() => {
    const load = async () => {
      if (!batchId) return;
      try {
        setLoading(true);
        const res = await getTicketsByBatch(Number(batchId));
        const data = (res as any).data?.data ?? res.data?.data ?? res.data;
        setTickets(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [batchId]);

  const filtered = useMemo(() => {
    if (filter === 'all') return tickets;
    if (filter === 'static') return tickets.filter((t) => !('qrUrl' in t));
    return tickets.filter((t) => 'qrUrl' in t);
  }, [tickets, filter]);

  // Determine if current view is of dynamic tickets (to show dynamic columns)
  const showDynamicCols = useMemo(() => filtered.some((t) => 'qrUrl' in t), [filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:bg-transparent hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold">Tickets</h1>
          <div className="inline-flex gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'static' ? 'default' : 'outline'} onClick={() => setFilter('static')}>Static</Button>
            <Button variant={filter === 'dynamic' ? 'default' : 'outline'} onClick={() => setFilter('dynamic')}>Dynamic</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Tickets ({loading ? 'loading…' : filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading tickets…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No tickets found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                      <th className="py-2 pr-4">Code</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Barcode</th>
                      {showDynamicCols && (
                        <>
                          <th className="py-2 pr-4">QR URL</th>
                          <th className="py-2 pr-4">Dynamic Result</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
                        <td className="py-2 pr-4 font-mono">{t.code}</td>
                        <td className="py-2 pr-4 capitalize">{t.status}</td>
                        <td className="py-2 pr-4">
                          <div className="bg-white rounded inline-block p-1">
                            <Barcode value={t.code} format="CODE128" width={1} height={32} displayValue={false} />
                          </div>
                        </td>
                        {showDynamicCols && (
                          <>
                            <td className="py-2 pr-4 truncate max-w-xs">
                              {'qrUrl' in t ? (t.qrUrl || '—') : '—'}
                            </td>
                            <td className="py-2 pr-4">
                              {'dynamicResult' in t ? (t.dynamicResult || '—') : '—'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketsPage;
