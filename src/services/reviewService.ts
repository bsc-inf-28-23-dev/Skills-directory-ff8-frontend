import type {
  PaginatedResponse,
  Review,
  ReviewInput,
  ReviewSummaryData,
} from "../types";
import api from "./api";

/** GET /providers/:providerId/reviews?page=&pageSize= */
export async function getProviderReviews(
  providerId: string,
  page = 1,
  pageSize = 5,
): Promise<PaginatedResponse<Review>> {
  const { data } = await api.get<PaginatedResponse<Review>>(
    `/providers/${encodeURIComponent(providerId)}/reviews`,
    { params: { page, pageSize } },
  );
  return data;
}

/** GET /providers/:providerId/reviews/summary */
export async function getReviewSummary(
  providerId: string,
): Promise<ReviewSummaryData> {
  const { data } = await api.get<ReviewSummaryData>(
    `/providers/${encodeURIComponent(providerId)}/reviews/summary`,
  );
  return data;
}

/**
 * POST /providers/:providerId/reviews
 * The backend decides eligibility. A 409 means the resident already reviewed
 * this provider; a 403 means they are not eligible.
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

/** GET /residents/me/reviews */
export async function getMyReviews(): Promise<Review[]> {
  const { data } = await api.get<Review[]>("/residents/me/reviews");
  return data;
}

/** PATCH /reviews/:reviewId (to be confirmed with backend) */
export async function updateReview(
  reviewId: string,
  input: ReviewInput,
): Promise<Review> {
  const { data } = await api.patch<Review>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    input,
  );
  return data;
}

/** DELETE /reviews/:reviewId (to be confirmed with backend) */
export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/reviews/${encodeURIComponent(reviewId)}`);
}