import { InternetPackage } from '../models/package.model';

/** Development-only fallback. The API remains the intended package source. */
export const MOCK_PACKAGES: InternetPackage[] = [
  {
    id: 1,
    name: 'Nusu siku ya kibomba',
    price: 500,
    duration_minutes: 720,
    speed: '15 Mbps',
    is_active: true,
    accent: 'blue',
  },
  {
    id: 2,
    name: 'Furahia siku kijanja',
    price: 1_000,
    duration_minutes: 1440,
    speed: '15 Mbps',
    is_active: true,
    accent: 'green',
  },
  {
    id: 3,
    name: 'Wiki kitajiri zaidi',
    price: 5_000,
    duration_minutes: 10_080,
    speed: '15 Mbps',
    is_active: true,
    accent: 'purple',
  },
  {
    id: 4,
    name: 'Mwezi bila kikomo',
    price: 25_000,
    duration_minutes: 43_200,
    speed: '15 Mbps',
    is_active: true,
    accent: 'orange',
  },
];

