import type {
  PaginatedResponse,
  Review,
  ReviewInput,
  ReviewSummaryData,
} from "../types";
import api from "./api";

// List endpoints may return { data: [...], meta: {...} } or a plain array.
function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const wrapped = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(wrapped) ? (wrapped as T[]) : [];
}

/**
 * GET /providers/:providerId/reviews (exists).
 * The backend paginates with `page` and `limit` and answers { data, meta }.
 * The result carries the list under several common names so the UI can use it.
 */
export async function getProviderReviews(
  providerId: string,
  page = 1,
  pageSize = 5,
): Promise<PaginatedResponse<Review>> {
  const { data } = await api.get(
    `/providers/${encodeURIComponent(providerId)}/reviews`,
    { params: { page, limit: pageSize } },
  );

  const items = toList<Review>(data);
  const meta = (data as { meta?: Record<string, unknown> } | null)?.meta ?? {};
  const total = typeof meta.total === "number" ? meta.total : items.length;
  const totalPages =
    typeof meta.totalPages === "number"
      ? meta.totalPages
      : Math.max(1, Math.ceil(total / pageSize));

  return {
    ...(Array.isArray(data) ? {} : (data as object)),
    data: items,
    items,
    total,
    page,
    pageSize,
    limit: pageSize,
    totalPages,
  } as unknown as PaginatedResponse<Review>;
}

/**
 * The backend has no /reviews/summary route, so the summary is worked out from
 * the provider's reviews (GET /providers/:providerId/reviews).
 */
export async function getReviewSummary(
  providerId: string,
): Promise<ReviewSummaryData> {
  const { data } = await api.get(
    `/providers/${encodeURIComponent(providerId)}/reviews`,
    { params: { page: 1, limit: 100 } },
  );

  const reviews = toList<{ rating?: number }>(data);
  const meta = (data as { meta?: { total?: number } } | null)?.meta;
  const count = typeof meta?.total === "number" ? meta.total : reviews.length;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let rated = 0;
  for (const review of reviews) {
    const rating = Number(review.rating);
    if (rating >= 1 && rating <= 5) {
      distribution[Math.round(rating)] += 1;
      sum += rating;
      rated += 1;
    }
  }
  const average = rated > 0 ? Math.round((sum / rated) * 10) / 10 : 0;

  return {
    average,
    averageRating: average,
    rating: average,
    count,
    total: count,
    totalReviews: count,
    reviewCount: count,
    distribution,
  } as unknown as ReviewSummaryData;
}

/**
 * POST /providers/:providerId/reviews (exists).
 * A 409 means the resident already reviewed this provider; a 403 means they are
 * not eligible.
 */
export async function submitReview(
  providerId: string,
  input: ReviewInput,
): Promise<Review> {
  const { data } = await api.post<Review>(
    `/providers/${encodeURIComponent(providerId)}/reviews`,
    input,
  );
  return data;
}

/** The backend has no GET /residents/me/reviews route, so this returns an empty list. */
export async function getMyReviews(): Promise<Review[]> {
  return [];
}

/** The backend has no PATCH /reviews/:id route. */
export async function updateReview(
  _reviewId: string,
  _input: ReviewInput,
): Promise<Review> {
  throw new Error("Editing reviews is not available yet.");
}

/** The backend has no DELETE /reviews/:id route. */
export async function deleteReview(_reviewId: string): Promise<void> {
  throw new Error("Deleting reviews is not available yet.");
}