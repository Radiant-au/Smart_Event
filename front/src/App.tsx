import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/Events/CreateEvent';
import EventsList from './pages/Events/EventsList';
import TicketBatches from './pages/Events/TicketBatches';
import TicketsPage from './pages/Tickets/TicketsPage';
import Scanner from './pages/Tickets/Scanner';
import useAppStore from './store/useAppStore';

function App() {
  const { auth } = useAppStore();

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                auth.token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
