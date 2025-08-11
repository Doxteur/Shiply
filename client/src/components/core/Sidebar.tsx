import { Link, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import {
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { logout } from '@/app/features/auth/authSlice';
import { AppDispatch } from '@/app/store';

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
];

function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      // La redirection sera gérée par le middleware d'authentification
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-background/80 backdrop-blur-xl border-r border-border/40 relative transition-all duration-200 ease-in-out",
        isCollapsed ? "w-20" : "w-56"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-background shadow-md flex items-center justify-center hover:bg-muted transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className="flex h-20 items-center justify-center border-b border-border/40 bg-gradient-to-b from-background to-background/50">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-primary" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                N22 Template
              </h1>
            </motion.div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-primary" />
            </div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                isCollapsed && "justify-center"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-primary/10" />
              )}
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/40 bg-gradient-to-t from-background to-background/50 p-4">
        <button
          onClick={handleLogout}
          className={cn(
            " hover:cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors group",
            isCollapsed && "justify-center"
          )}
        >
          <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-destructive/10 group-hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="group-hover:text-destructive transition-colors"
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
