import { type Template } from '@/lib/domain/types';

export const DEFAULT_TEMPLATES: Template[] = [
  { id: 'minimalist', name: 'Minimalista', description: 'Perfil limpio y simple' },
  { id: 'portfolio', name: 'Portafolio', description: 'Exhibición de portafolio profesional' },
  { id: 'creative', name: 'Creativa', description: 'Llamativo con animaciones' },
  { id: 'terminal', name: 'Terminal', description: 'Estética de terminal estilo hacker' },
];

export const EXAMPLE_USERS = [
  { username: 'torvalds', label: 'Linus Torvalds' },
  { username: 'gaearon', label: 'Dan Abramov' },
  { username: 'sindresorhus', label: 'Sindre Sorhus' },
  { username: 'yyx990803', label: 'Evan You' },
];
