export type ProviderVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "suspended";

export type ProviderDocumentStatus = "unsubmitted" | "pending" | "verified" | "rejected";

export interface ProviderProfileDocument {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  size: number;
  status: ProviderDocumentStatus;
  submittedAt?: string;
  feedback?: string;
}

export interface ProviderPortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface ProviderBusinessProfile {
  tagline: string;
  additionalCategories: string[];
  yearsExperience: number | null;
  businessHours: string;
  registrationDetails: string;
  businessAddress: string;
  city: string;
  areasServed: string[];
  physicalPremises: boolean;
  travelsToCustomer: boolean;
  skills: string[];
  qualifications: string[];
  previousExperience: string;
  businessLogo?: string;
  coverImage?: string;
  publicPhone?: string;
  publicEmail?: string;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  portfolio: ProviderPortfolioItem[];
  verificationStatus: ProviderVerificationStatus;
  verificationDocuments: ProviderProfileDocument[];
}

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
  profile?: ProviderBusinessProfile;
}