import { useCallback, useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import ErrorAlert from "../../components/ErrorAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getProviderReviews } from "../../services/reviewService";
import type { ApiError, Review } from "../../types";
import ReviewItem from "./ReviewItem";

const PAGE_SIZE = 5;

interface Props {
  providerId: string;
  refreshKey: number;
}

export default function ReviewList({ providerId, refreshKey }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const requestKey = JSON.stringify([providerId, refreshKey]);
  const loading = loadedRequestKey !== requestKey;

  const loadFirstPage = useCallback(async () => {
    try {
      const res = await getProviderReviews(providerId, 1, PAGE_SIZE);
      setReviews(res.items);
      setTotal(res.total);
      setPage(1);
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoadedRequestKey(requestKey);
    }
  }, [providerId, requestKey]);

  useEffect(() => {
    void Promise.resolve().then(loadFirstPage);
  }, [loadFirstPage, refreshKey]);

  const retryFirstPage = () => {
    setLoadedRequestKey(null);
    setError(null);
    void loadFirstPage();
  };

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const res = await getProviderReviews(providerId, page + 1, PAGE_SIZE);
      setReviews((prev) => [...prev, ...res.items]);
      setTotal(res.total);
      setPage(page + 1);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading reviews..." />;
  if (error && reviews.length === 0) {
    return <ErrorAlert message={error.message} onRetry={retryFirstPage} />;
  }
  if (reviews.length === 0) {
    return (
      <EmptyState icon="bi-chat-square-text" title="No reviews yet">
        Be the first to share your experience with this provider.
      </EmptyState>
    );
  }

  return (
    <>
      {error && <div className="mb-3"><ErrorAlert message={error.message} /></div>}
      <ul className="list-unstyled mb-0">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </ul>
      {reviews.length < total && (
        <div className="text-center mt-4">
          <button type="button" className="btn btn-trade" onClick={loadMore} disabled={loadingMore}>
            {loadingMore && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
            Load more reviews
          </button>
        </div>
      )}
    </>
  );
}