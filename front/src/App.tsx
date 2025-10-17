import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/toaster";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/Events/CreateEvent";
import EventsList from "./pages/Events/EventsList";
import TicketBatches from "./pages/Events/TicketBatches";
import Scanner from "./pages/Tickets/Scanner";
import { useAuthContext } from "@/context/auth-context";
import TicketLayoutEditor from "./pages/Events/TicketLayoutEditor";
import TicketsPage from "./pages/Tickets/TicketsPage";
import ScannedTicketsPage from "./pages/Events/ScannedTicketsPage";

function App() {
  const { isAuthenticated } = useAuthContext();

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          {/*  Redirect based on authentication */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/*  Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/*  Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/batches"
            element={
              <ProtectedRoute>
                <TicketBatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches/layout/:batchId"
            element={
              <ProtectedRoute>
                <TicketLayoutEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches/:batchId/tickets"
            element={
              <ProtectedRoute>
                <TicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <Scanner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/batches/:batchId/scanned-tickets"
            element={
              <ProtectedRoute>
                <ScannedTicketsPage />
              </ProtectedRoute>
            }
          />
          {/* 🛑 Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
