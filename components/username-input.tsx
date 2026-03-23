'use client';

import { useState, useCallback } from 'react';
import { Search, Github, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UsernameInputProps {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}

export function UsernameInput({ onSubmit, isLoading = false }: UsernameInputProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateUsername = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setError('Por favor ingresa un nombre de usuario de GitHub');
      return false;
    }
    if (value.length > 39) {
      setError('El nombre de usuario es demasiado largo (máximo 39 caracteres)');
      return false;
    }
    if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(value)) {
      setError('Formato de nombre de usuario inválido');
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateUsername(username) && !isLoading) {
      onSubmit(username.trim());
    }
  }, [username, isLoading, onSubmit, validateUsername]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (error && value) {
      setError(null);
    }
  }, [error]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-3">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ingresa nombre de usuario de GitHub..."
                value={username}
                onChange={handleChange}
                disabled={isLoading}
                className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono"
                aria-label="Nombre de usuario de GitHub"
                aria-invalid={!!error}
                aria-describedby={error ? "username-error" : undefined}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !username.trim()}
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all glow-primary disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  <span>Generar</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <p id="username-error" className="text-sm text-destructive pl-1" role="alert">
            {error}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          Ingresa cualquier nombre de usuario público de GitHub para generar un perfil README profesional
        </p>
      </div>
    </form>
  );
}
