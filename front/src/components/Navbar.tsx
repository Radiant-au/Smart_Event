import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Ticket, Moon, Sun, LogOut, LayoutDashboard } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthContext } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/api/auth-api';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuthContext();
  const [me, setMe] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchMe = async () => {
      try {
        const res = await getCurrentUser();
        setMe((res as any).data?.data ?? res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMe();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    // logout already navigates to /login in the hook
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
            {isAuthenticated && (
              <>
                <Link to="/dashboard">
                  <Button size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                   {me?.name ?? 'User'}
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

            {isAuthenticated && (
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
