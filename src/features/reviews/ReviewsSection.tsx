import { useState } from "react";
import { ArrowRight } from "lucide-react";
import ErrorAlert from "../../components/ErrorAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import Eyebrow from "../../components/Eyebrow";
import { useAsync } from "../../hooks/useAsync";
import { getReviewSummary } from "../../services/reviewService";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import ReviewSummary from "./ReviewSummary";

export default function ReviewsSection({ providerId }: { providerId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const summary = useAsync(() => getReviewSummary(providerId), [providerId, refreshKey]);

  return (
    <section aria-labelledby="reviews-heading">
      <Eyebrow>Community verdict</Eyebrow>
      <h2 id="reviews-heading" className="display-heading display-heading-md mb-4">
        Ratings and reviews
      </h2>

      <div className="row g-4 g-lg-5 mb-5">
        <div className="col-12 col-md-4 col-lg-3">
          <div className="surface-box p-4 h-100">
            {summary.loading && !summary.data && <LoadingSpinner label="Loading..." />}
            {summary.error && <ErrorAlert message={summary.error.message} onRetry={summary.reload} />}
            {summary.data && <ReviewSummary summary={summary.data} />}
          </div>
        </div>

        <div className="col-12 col-md-8 col-lg-9 d-flex flex-column justify-content-center">
          <p className="text-muted-ink mb-4">
            Reviews are written by residents who have worked with this provider. 
            Ratings are averaged across all submitted reviews.
          </p>
          {!showForm && (
            <button type="button" className="btn btn-athletic align-self-start" onClick={() => setShowForm(true)}>
              Write a review <ArrowRight />
            </button>
          )}
          {showForm && (
            <div className="surface-box p-4">
              <h3 className="section-label">Write a review</h3>
              <ReviewForm providerId={providerId} onSubmitted={() => { setShowForm(false); setRefreshKey((k) => k + 1); }} embedded />
              <button type="button" className="btn btn-nav mt-2" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      <ul className="list-unstyled mb-0">
        <ReviewList providerId={providerId} refreshKey={refreshKey} />
      </ul>
    </section>
  );
}