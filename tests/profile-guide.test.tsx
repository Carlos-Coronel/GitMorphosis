import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfileGuide } from '@/components/generator/profile-guide';

describe('ProfileGuide', () => {
  it('permite recorrer y contraer los pasos de uso', () => {
    render(<ProfileGuide />);

    expect(screen.getByText('Busca tu perfil')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /2\. Plantilla/ }));
    expect(screen.getByText('Elige el diseño')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Guía interactiva para crear tu perfil/ }));
    expect(screen.queryByText('Elige el diseño')).not.toBeInTheDocument();
  });

  it('muestra el destino de instalación al completar una generación', () => {
    render(<ProfileGuide generatedUsername="octocat" assetCount={8} />);

    expect(screen.getByText('Descarga e instala')).toBeInTheDocument();
    expect(screen.getByText('octocat/octocat')).toBeInTheDocument();
    expect(screen.getByText(/8 SVG/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear el repositorio de perfil/ })).toHaveAttribute(
      'href',
      'https://github.com/new?name=octocat&description=Mi+perfil+de+GitHub'
    );
  });

  it('lleva al usuario a la sección correspondiente', () => {
    const scrollIntoView = vi.fn();
    const target = document.createElement('div');
    target.id = 'profile-username';
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    render(<ProfileGuide />);
    fireEvent.click(screen.getByRole('button', { name: 'Ir al usuario' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    target.remove();
  });
});
