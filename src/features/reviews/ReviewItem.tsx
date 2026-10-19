import type { ReactNode } from "react";
import Avatar from "../../components/Avatar";
import type { Review } from "../../types";
import { formatDate } from "../../utils/format";
import { StarDisplay } from "./StarRating";

interface Props {
  review: Review;
  showProvider?: boolean;
  actions?: ReactNode;
}

export default function ReviewItem({ review, showProvider = false, actions }: Props) {
  const heading = showProvider ? review.providerName ?? "Provider" : review.reviewerName;
  const date = formatDate(review.createdAt);

  return (
    <li className="review-item">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-2">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={heading} size={40} />
          <div>
            <div className="fw-semibold">{heading}</div>
            <StarDisplay value={review.rating} size="0.85rem" />
          </div>
        </div>
        {date && (
          <time className="small text-muted-ink text-uppercase" style={{ letterSpacing: "0.06em" }} dateTime={review.createdAt}>
            {date}
          </time>
        )}
      </div>
      <p className="review-text mb-0">"{review.text}"</p>
      {actions && <div className="mt-3 d-flex gap-2">{actions}</div>}
    </li>
  );
}