import type { ProviderSummary } from "../types";
import plumber from "../assets/providers/plumber.jpg";
import electrician from "../assets/providers/electrician.jpg";
import mechanical from "../assets/providers/mechanical.jpg";
import { USE_DEV_FIXTURES } from "../config/env";

const SAMPLE_BY_CATEGORY: Record<string, string> = {
  plumbing: plumber,
  electrical: electrician,
  "electrical services": electrician,
  mechanics: mechanical,
  mechanical: mechanical,
};

export function getProviderCoverUrl(
  p: Pick<ProviderSummary, "category" | "profileImageUrl">,
): string | null {
  if (p.profileImageUrl) return p.profileImageUrl;
  if (!USE_DEV_FIXTURES) return null;
  const key = p.category.trim().toLowerCase();
  return SAMPLE_BY_CATEGORY[key] ?? null;
}