import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import Barcode from "react-barcode";
import { getScannedTicketsByBatch } from "@/api/ticket-api";

type TicketDto = {
  code: string;
  status: string;
  scannerName: string;
  price: string;
  isDynamic: boolean;
};

type FilterMode = "all" | "normal" | "gamify";

const ScannedTicketsPage = () => {
  const { batchId } = useParams<{
    batchId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { collaboratorName?: string };
  const collaboratorName = state?.collaboratorName;

  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    const loadTickets = async () => {
      if (!batchId) return;
      try {
        setLoading(true);
        const res = await getScannedTicketsByBatch(Number(batchId));
        const data = (res as any).data?.data ?? res.data?.data ?? res.data;

        const usedTickets: TicketDto[] = Array.isArray(data)
          ? data.map((t) => ({ ...t, status: "used" }))
          : [];
        setTickets(usedTickets);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [batchId]);

  const filteredTickets = useMemo(() => {
    switch (filter) {
      case "normal":
        return tickets.filter((t) => !t.isDynamic);
      case "gamify":
        return tickets.filter((t) => t.isDynamic);
      default:
        return tickets;
    }
  }, [tickets, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold">
            Cards Scanned by {collaboratorName}
          </h1>
          <div className="inline-flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "normal" ? "default" : "outline"}
              onClick={() => setFilter("normal")}
            >
              Normal
            </Button>
            <Button
              variant={filter === "gamify" ? "default" : "outline"}
              onClick={() => setFilter("gamify")}
            >
              Gamify
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Tickets ({loading ? "loading…" : filteredTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">
                Loading tickets…
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No tickets found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                      <th className="py-2 pr-4">Code</th>
                      <th className="py-2 pr-4">Barcode</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Price</th>
                      <th className="py-2 pr-4">Scanner Name</th>
                      <th className="py-2 pr-4">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-900/40 transition-colors"
                      >
                        <td className="py-2 pr-4 font-mono">{ticket.code}</td>
                        <td className="py-2 pr-4">
                          <div className="bg-white rounded inline-block p-1">
                            <Barcode
                              value={ticket.code}
                              format="CODE128"
                              width={1}
                              height={32}
                              displayValue={false}
                            />
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <button
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
          shadow-md transition-all duration-300 ease-in-out transform
          bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-300/40 hover:shadow-green-400/60 hover:scale-105`}
                          >
                            {ticket.status}
                          </button>
                        </td>
                        <td className="py-2 pr-4">{ticket.price}</td>
                        <td className="py-2 pr-4">
                          {ticket.scannerName || "—"}
                        </td>
                        <td className="py-2 pr-4">
                          {ticket.isDynamic ? "Gamify" : "Normal"}
                        </td>
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

export default ScannedTicketsPage;
