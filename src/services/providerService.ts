import api from "./api";
import type { ServiceProvider } from "../types/serviceProvider";

export async function getProviders(): Promise<ServiceProvider[]> {
  const { data } = await api.get<ServiceProvider[]>("/providers");
  return data;
}

export async function updateProvider(
  providerId: string,
  provider: ServiceProvider,
): Promise<ServiceProvider> {
  const { data } = await api.patch<ServiceProvider>(
    `/providers/${encodeURIComponent(providerId)}`,
    provider,
  );
  return data;
}