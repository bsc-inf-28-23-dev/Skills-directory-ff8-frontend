import type { ReviewSummaryData } from "../../types";
import { formatRating } from "../../utils/format";
import { StarDisplay } from "./StarRating";

export default function ReviewSummary({ summary }: { summary: ReviewSummaryData }) {
  if (summary.reviewCount === 0 || summary.averageRating == null) {
    return <p className="text-muted-ink mb-0">No ratings yet.</p>;
  }

  return (
    <div className="d-flex align-items-center gap-4 flex-wrap">
      <span className="rating-score">{formatRating(summary.averageRating)}</span>
      <div>
        <StarDisplay value={summary.averageRating} size="1.1rem" />
        <div className="small text-muted-ink text-uppercase mt-1" style={{ letterSpacing: "0.06em" }}>
          Based on {summary.reviewCount} review{summary.reviewCount === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}