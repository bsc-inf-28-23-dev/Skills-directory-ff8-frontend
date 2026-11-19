export type ProviderServiceStatus =
  | "draft"
  | "pending"
  | "active"
  | "inactive"
  | "rejected";

export type ProviderServicePricingModel =
  | "fixed"
  | "starting"
  | "quotation";

export interface ProviderService {
  id: string;
  providerId: string;
  name: string;
  category: string;
  subcategory: string;
  shortDescription: string;
  description: string;
  images: string[];
  coverImageIndex: number;
  pricingModel: ProviderServicePricingModel;
  priceMwk: number | null;
  operatingLocation: string;
  coverageAreas: string[];
  travelsToCustomer: boolean;
  offeredAtPremises: boolean;
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  availableForBooking: boolean;
  status: ProviderServiceStatus;
  rejectionReason?: string;
  bookingCount: number | null;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ProviderServiceInput = Omit<
  ProviderService,
  "id" | "providerId" | "bookingCount" | "averageRating" | "createdAt" | "updatedAt"
>;
