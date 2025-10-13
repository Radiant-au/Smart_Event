// import { useParams, useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
// import { Button } from '../../components/ui/button';
// import { Badge } from '../../components/ui/badge';
// import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
// import Barcode from 'react-barcode';
// import useAppStore from '../../store/useAppStore';
// import { useToast } from '../../hooks/use-toast';

// const TicketsPage = () => {
//   const { batchId } = useParams<{ batchId: string }>();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const { getBatchById, getTicketsByBatch, markTicketAsUsed } = useAppStore();

//   const batch = batchId ? getBatchById(Number(batchId)) : null;
//   const tickets = batchId ? getTicketsByBatch(Number(batchId)) : [];

//   if (!batch) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
//         <Card className="max-w-md">
//           <CardContent className="py-8 text-center">
//             <p className="text-muted-foreground mb-4">Batch not found</p>
//             <Button onClick={() => navigate('/events')}>
//               Back to Events
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const handleMarkAsUsed = (ticketId: number) => {
//     markTicketAsUsed(ticketId);
//     toast({
//       title: 'Ticket marked as used',
//       description: 'The ticket status has been updated',
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
//       <div className="container mx-auto px-4 py-8">
//         <Button
//           variant="ghost"
//           onClick={() => navigate(-1)}
//           className="mb-6"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>

//         <div className="mb-8">
//           <h1 className="text-4xl font-bold mb-2">{batch.name} Tickets</h1>
//           <p className="text-muted-foreground">
//             View and manage all tickets in this batch
//           </p>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>
//               Tickets ({tickets.length} total)
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {tickets.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 No tickets generated yet
//               </div>
//             ) : (
//               <div className="space-y-8">
//                 {tickets.map((ticket) => (
//                   <div
//                     key={ticket.id}
//                     className="border rounded-lg p-6 space-y-4"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <div className="font-mono font-semibold text-lg">
//                           {ticket.barcode_code}
//                         </div>
//                         <div className="mt-1">
//                           {ticket.status === 'unused' ? (
//                             <Badge variant="default" className="bg-green-500">
//                               <CheckCircle className="mr-1 h-3 w-3" />
//                               Unused
//                             </Badge>
//                           ) : (
//                             <Badge variant="secondary">
//                               <XCircle className="mr-1 h-3 w-3" />
//                               Used
//                             </Badge>
//                           )}
//                         </div>
//                       </div>
//                       {ticket.status === 'unused' && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleMarkAsUsed(ticket.id)}
//                         >
//                           Mark as Used
//                         </Button>
//                       )}
//                     </div>
//                     <div className="bg-white p-4 rounded-lg inline-block">
//                       <Barcode
//                         value={ticket.barcode_code}
//                         format="CODE128"
//                         width={2}
//                         height={100}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default TicketsPage;
