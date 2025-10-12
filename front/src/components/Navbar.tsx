import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Ticket, Moon, Sun, LogOut, LayoutDashboard } from 'lucide-react';
import { useTheme } from 'next-themes';
import useAppStore from '../store/useAppStore';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { auth, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              SmartEvents
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {auth.token && (
              <>
                <Link to="/dashboard">
                  <Button size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {auth.user?.username}
                </span>
              </>
            )}

            <Button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {auth.token && (
              <Button size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
