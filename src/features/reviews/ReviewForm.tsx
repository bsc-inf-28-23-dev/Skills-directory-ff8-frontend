import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { submitReview } from "../../services/reviewService";
import type { ApiError } from "../../types";
import { MAX_REVIEW_LENGTH, validateReview } from "../../utils/validation";
import { useAuth } from "../auth/AuthContext";
import { StarInput } from "./StarRating";

interface Props {
  providerId: string;
  onSubmitted: () => void;
  /** Renders the form inside a modal when true (borderless, no card padding). */
  embedded?: boolean;
}

type Blocked = { kind: "duplicate" | "ineligible"; message: string } | null;

export default function ReviewForm({ providerId, onSubmitted, embedded = false }: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; text?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [blocked, setBlocked] = useState<Blocked>(null);

  if (!user) {
    return (
      <p className="status-line mb-0">
        <Link to="/login" state={{ from: location.pathname }}>Log in</Link> as a resident to write a review.
      </p>
    );
  }

  if (user.role !== "resident") {
    return <p className="status-line mb-0">Only residents can write reviews.</p>;
  }

  if (blocked) {
    return <p className="status-line mb-0" role="status">{blocked.message}</p>;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setServerError(null);

    const found = validateReview({ rating, text });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await submitReview(providerId, { rating, text: text.trim() });
      setSuccess(true);
      setRating(0);
      setText("");
      onSubmitted();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 409) {
        setBlocked({ kind: "duplicate", message: apiError.message || "You have already reviewed this provider." });
      } else if (apiError.status === 403) {
        setBlocked({ kind: "ineligible", message: apiError.message || "You are not able to review this provider yet." });
      } else {
        setServerError(apiError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const body = (
    <>
      {success && (
        <p className="status-line mb-3" role="status">
          Thank you — your review has been submitted.
        </p>
      )}
      {serverError && <div className="alert-error mb-3" role="alert">{serverError}</div>}

      <div className="mb-3">
        <div id="review-rating-label" className="form-label mb-2">Your rating</div>
        <StarInput
          value={rating}
          onChange={(v) => {
            setRating(v);
            setErrors((prev) => ({ ...prev, rating: undefined }));
          }}
          disabled={submitting}
          invalid={!!errors.rating}
          labelledBy="review-rating-label"
          describedBy={errors.rating ? "review-rating-error" : undefined}
        />
        {errors.rating && (
          <div id="review-rating-error" className="invalid-feedback d-block">{errors.rating}</div>
        )}
      </div>

      <div className="form-field mb-3">
        <label htmlFor="review-text">Your review</label>
        <textarea
          id="review-text"
          rows={4}
          maxLength={MAX_REVIEW_LENGTH}
          className={errors.text ? "is-invalid" : ""}
          value={text}
          disabled={submitting}
          onChange={(e) => setText(e.target.value)}
          aria-describedby="review-text-help"
          placeholder="Describe the work and how it went"
        />
        {errors.text && <div className="invalid-feedback d-block">{errors.text}</div>}
        <div id="review-text-help" className="form-text">
          {text.trim().length}/{MAX_REVIEW_LENGTH} characters
        </div>
      </div>

      <button type="submit" className="btn btn-athletic" disabled={submitting}>
        {submitting && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
        Submit review <ArrowRight />
      </button>
    </>
  );

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Write a review" className={embedded ? "" : ""}>
      {body}
    </form>
  );
}