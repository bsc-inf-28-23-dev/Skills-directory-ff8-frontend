export type ProviderServiceStatus =
  | "draft"
  | "pending"
  | "active"
  | "inactive"
  | "rejected";

export interface ProviderService {
  id: string;
  providerId: string;
  name: string;
  category: string;
  shortDescription: string;
  imageUrl: string;
  status: ProviderServiceStatus;
  rejectionReason?: string;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ProviderServiceInput = Pick<
  ProviderService,
  "name" | "category" | "shortDescription" | "imageUrl"
>;
