import { USE_DEV_FIXTURES } from "../config/env";
import type {
  PaginatedResponse,
  Review,
  ReviewInput,
  ReviewSummaryData,
} from "../types";
import { apiClient } from "./apiClient";
import { delay, fixtureReviews } from "./devFixtures";

let devReviews: Review[] = [...fixtureReviews];

function devSummary(providerId: string): ReviewSummaryData {
  const list = devReviews.filter((r) => r.providerId === providerId);
  const total = list.reduce((sum, r) => sum + r.rating, 0);
  return {
    reviewCount: list.length,
    averageRating: list.length ? total / list.length : null,
  };
}

/** GET /providers/:providerId/reviews?page=&pageSize= */
export async function getProviderReviews(
  providerId: string,
  page = 1,
  pageSize = 5,
): Promise<PaginatedResponse<Review>> {
  if (USE_DEV_FIXTURES) {
    const list = devReviews.filter((r) => r.providerId === providerId);
    const start = (page - 1) * pageSize;
    return delay({
      items: list.slice(start, start + pageSize),
      page,
      pageSize,
      total: list.length,
    });
  }
  const { data } = await apiClient.get<PaginatedResponse<Review>>(
    `/providers/${encodeURIComponent(providerId)}/reviews`,
    { params: { page, pageSize } },
  );
  return data;
}

/** GET /providers/:providerId/reviews/summary */
export async function getReviewSummary(
  providerId: string,
): Promise<ReviewSummaryData> {
  if (USE_DEV_FIXTURES) return delay(devSummary(providerId));
  const { data } = await apiClient.get<ReviewSummaryData>(
    `/providers/${encodeURIComponent(providerId)}/reviews/summary`,
  );
  return data;
}


export async function submitReview(
  providerId: string,
  input: ReviewInput,
): Promise<Review> {
  if (USE_DEV_FIXTURES) {
    const review: Review = {
      id: `dev-review-${Date.now()}`,
      providerId,
      reviewerId: "dev-resident-1",
      reviewerName: "Sample Resident",
      rating: input.rating,
      text: input.text,
      createdAt: new Date().toISOString(),
    };
    devReviews = [review, ...devReviews];
    return delay(review);
  }
  const { data } = await apiClient.post<Review>(
    `/providers/${encodeURIComponent(providerId)}/reviews`,
    input,
  );
  return data;
}

/** GET /residents/me/reviews */
export async function getMyReviews(): Promise<Review[]> {
  if (USE_DEV_FIXTURES) {
    return delay(devReviews.filter((r) => r.reviewerId === "dev-resident-1"));
  }
  const { data } = await apiClient.get<Review[]>("/residents/me/reviews");
  return data;
}

/** PATCH /reviews/:reviewId (to be confirmed: may not be supported) */
export async function updateReview(
  reviewId: string,
  input: ReviewInput,
): Promise<Review> {
  if (USE_DEV_FIXTURES) {
    devReviews = devReviews.map((r) =>
      r.id === reviewId ? { ...r, ...input } : r,
    );
    return delay(devReviews.find((r) => r.id === reviewId) as Review);
  }
  const { data } = await apiClient.patch<Review>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    input,
  );
  return data;
}

/** DELETE /reviews/:reviewId (to be confirmed: may not be supported) */
export async function deleteReview(reviewId: string): Promise<void> {
  if (USE_DEV_FIXTURES) {
    devReviews = devReviews.filter((r) => r.id !== reviewId);
    return delay(undefined);
  }
  await apiClient.delete(`/reviews/${encodeURIComponent(reviewId)}`);
}
