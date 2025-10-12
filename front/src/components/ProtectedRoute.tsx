import { Navigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { auth } = useAppStore();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
