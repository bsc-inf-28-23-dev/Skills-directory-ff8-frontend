import { Link, useParams } from "react-router-dom";
import Eyebrow from "../components/Eyebrow";
import ReviewsSection from "../features/reviews/ReviewsSection";

export default function ProviderReviewsPage() {
  const { providerId } = useParams<{ providerId: string }>();

  if (!providerId) {
    return (
      <div className="page-container py-5">
        <p className="text-muted-ink">No provider selected.</p>
      </div>
    );
  }

  return (
    <div className="page-container py-5" style={{ maxWidth: 960 }}>
      <nav className="mb-4">
        <Link to="/resident/dashboard" className="text-uppercase small fw-semibold">
          ← Back to dashboard
        </Link>
      </nav>

      <header className="mb-5">
        <Eyebrow>Reviews</Eyebrow>
        <h1 className="display-heading display-heading-lg">
          What people say
        </h1>
      </header>

      <ReviewsSection providerId={providerId} />
    </div>
  );
}