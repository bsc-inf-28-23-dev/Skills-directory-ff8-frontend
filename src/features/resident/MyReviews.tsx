import { useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import ErrorAlert from "../../components/ErrorAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAsync } from "../../hooks/useAsync";
import { deleteReview, getMyReviews, updateReview } from "../../services/reviewService";
import type { ApiError, Review } from "../../types";
import { MAX_REVIEW_LENGTH, validateReview } from "../../utils/validation";
import ReviewItem from "../reviews/ReviewItem";
import { StarInput } from "../reviews/StarRating";

export default function MyReviews() {
  const { data, loading, error, reload } = useAsync(getMyReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Review | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setActionError(null);
    try {
      await deleteReview(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setActionError((err as ApiError).message);
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading your reviews..." />;
  if (error) return <ErrorAlert message={error.message} onRetry={reload} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState icon="bi-star" title="You have not written any reviews yet">
        Reviews you submit on provider pages will appear here.
      </EmptyState>
    );
  }

  return (
    <>
      {actionError && (
        <div className="mb-3">
          <ErrorAlert message={actionError} />
        </div>
      )}
      <ul className="list-unstyled mb-0">
        {data.map((review) =>
          editingId === review.id ? (
            <li key={review.id} className="review-item">
              <EditReviewForm
                review={review}
                onCancel={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  reload();
                }}
              />
            </li>
          ) : (
            <ReviewItem
              key={review.id}
              review={review}
              showProvider
              actions={
                <>
                  <button
                    type="button"
                    className="btn btn-trade btn-sm"
                    onClick={() => setEditingId(review.id)}
                  >
                    <Pencil /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-sm"
                    onClick={() => setDeleting(review)}
                  >
                    <Trash2 /> Delete
                  </button>
                </>
              }
            />
          ),
        )}
      </ul>

      <ConfirmModal
        show={deleting !== null}
        title="Delete this review?"
        message="This will permanently remove your review. This cannot be undone."
        confirmLabel="Delete review"
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

function EditReviewForm({
  review,
  onCancel,
  onSaved,
}: {
  review: Review;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [text, setText] = useState(review.text);
  const [errors, setErrors] = useState<{ rating?: string; text?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const found = validateReview({ rating, text });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await updateReview(review.id, { rating, text: text.trim() });
      onSaved();
    } catch (err) {
      setServerError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const labelId = `edit-rating-${review.id}`;
  const textId = `edit-text-${review.id}`;

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Edit review for ${review.providerName ?? "provider"}`}>
      <div className="display-heading display-heading-md mb-3" style={{ fontSize: 20 }}>
        {review.providerName ?? "Provider"}
      </div>
      {serverError && <div className="alert-error mb-3" role="alert">{serverError}</div>}
      <div className="mb-3">
        <div id={labelId} className="form-label">Rating</div>
        <StarInput
          value={rating}
          onChange={setRating}
          disabled={saving}
          invalid={!!errors.rating}
          labelledBy={labelId}
        />
        {errors.rating && <div className="invalid-feedback d-block">{errors.rating}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor={textId} className="form-label">Review</label>
        <textarea
          id={textId}
          rows={3}
          maxLength={MAX_REVIEW_LENGTH}
          className={`form-control ${errors.text ? "is-invalid" : ""}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={saving}
        />
        {errors.text && <div className="invalid-feedback">{errors.text}</div>}
      </div>
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-athletic btn-sm" disabled={saving}>
          {saving && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
          Save review
        </button>
        <button type="button" className="btn btn-trade btn-sm" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}