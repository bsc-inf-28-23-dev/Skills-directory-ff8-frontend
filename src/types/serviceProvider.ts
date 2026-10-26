export interface ServiceProvider {
  id: string;
  name: string;
  person: string;
  category: string;
  area: string;
  rating: number;
  reviews: number;
  photo?: string;
  initials: string;
  services: string[];
  quote: string;
  reviewer: string;
  date: string;
  position: [number, number];
}