
import type { Provider } from "../types/provider";

export const categories = [
  "Plumbing",
  "Electrical",
  "HVAC & mechanical",
  "Roofing",
  "Carpentry",
  "Painting",
];

export const providers: Provider[] = [
  {
    id: "rapid-flow",
    name: "Rapid Flow Plumbing",
    person: "Daniel Banda",
    category: "Plumbing",
    area: "Central",
    rating: 4.8,
    reviews: 37,
    initials: "DB",
    services: [
      "Leak & burst pipe repair",
      "Faucet and fixture installation",
      "Drain clearing",
    ],
    quote: "Fixed our burst pipe within the hour.",
    reviewer: "Sarah M.",
    date: "September 2026",
    position: [-15.385, 35.318],
  },
  {
    id: "voltworks",
    name: "Voltworks Electric",
    person: "Chisomo Phiri",
    category: "Electrical",
    area: "Central",
    rating: 4.9,
    reviews: 52,
    initials: "CP",
    services: [
      "Home rewiring",
      "Lighting and outlet installation",
      "Electrical fault finding",
    ],
    quote: "Rewired our kitchen cleanly.",
    reviewer: "James K.",
    date: "September 2026",
    position: [-15.392, 35.326],
  },
  {
    id: "northline",
    name: "Northline Mechanical",
    person: "Peter Moyo",
    category: "HVAC & mechanical",
    area: "Northside",
    rating: 4.6,
    reviews: 28,
    initials: "PM",
    services: [
      "Air conditioning repairs",
      "Cooling system maintenance",
      "Air conditioning installation",
    ],
    quote: "Serviced our AC the same day.",
    reviewer: "Mary L.",
    date: "September 2026",
    position: [-15.378, 35.310],
  },
];
