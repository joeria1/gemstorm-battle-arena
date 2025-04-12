
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from '@/context/UserContext';
import { Gem, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const { user, login, logout } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      setIsLoginOpen(false);
      setUsername('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/cases', label: 'Case Battles' },
    { to: '/mines', label: 'Mines' },
    { to: '/blackjack', label: 'Blackjack' },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-md">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <NavLink to="/" className="text-2xl font-bold text-primary">
            GemStorm
          </NavLink>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 ml-10">
            {navLinks.map((link) => (
              <NavLink 
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-medium hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 bg-background/50 px-4 py-1.5 rounded-full">
                <Gem className="h-4 w-4 text-gem" />
                <span className="gem-text">{user.balance.toLocaleString()}</span>
              </div>
              
              <div className="hidden md:block">
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout ({user.username})
                </Button>
              </div>
            </>
          ) : (
            <Button variant="default" size="sm" className="hidden md:block" onClick={() => setIsLoginOpen(true)}>
              Login
            </Button>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container py-4 flex flex-col gap-4">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-2 py-2 rounded-md ${isActive ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-primary/10'}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            
            {user ? (
              <div className="flex flex-col gap-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Gem className="h-4 w-4 text-gem" />
                  <span className="gem-text">{user.balance.toLocaleString()}</span>
                </div>
                <Button variant="outline" onClick={logout}>
                  Logout ({user.username})
                </Button>
              </div>
            ) : (
              <Button className="w-full" onClick={() => {
                setIsMenuOpen(false);
                setIsLoginOpen(true);
              }}>
                Login
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login to GemStorm</DialogTitle>
            <DialogDescription>
              Enter a username to continue. New users will receive 5,000 gems to start.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Enter your username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="submit">Login</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
