import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsernameInput } from '@/components/username-input';

describe('entrada de usuario', () => {
  it('envía un nombre válido sin espacios laterales', async () => {
    const onSubmit = vi.fn(); const user = userEvent.setup(); render(<UsernameInput onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Nombre de usuario de GitHub'), ' octocat ');
    await user.click(screen.getByRole('button', { name: 'Generar' }));
    expect(onSubmit).toHaveBeenCalledWith('octocat');
  });

  it('muestra un error accesible para formato inválido', async () => {
    const user = userEvent.setup(); render(<UsernameInput onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('Nombre de usuario de GitHub'), '-invalid');
    await user.click(screen.getByRole('button', { name: 'Generar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Formato');
  });
});
