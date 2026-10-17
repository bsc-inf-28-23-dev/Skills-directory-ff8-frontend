
export interface Provider {
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

  // [latitude, longitude]
  position: [number, number];
}
