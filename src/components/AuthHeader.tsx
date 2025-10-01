import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface User {
  id: number;
  username: string;
}

interface AuthHeaderProps {
  user: User | null;
  login: (username: string, password: string, isRegister: boolean) => Promise<void>;
  logout: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ user, login, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password, isRegister);
      setIsOpen(false);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Welcome, {user.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={logout} variant="outline" size="sm" className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Login</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isRegister ? 'Register' : 'Login'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthHeader;
