
import './CategoryCard.css'

type CategoryCardProps = {
  name: string
  description: string
  symbol: string
  image?: string
  imageAlt?: string
}

function CategoryCard({
  name,
  description,
  symbol,
  image,
  imageAlt,
}: CategoryCardProps) {
  return (
    <article className="category-card">
      <div className="category-card-image">
        {image ? (
          <img
            src={image}
            alt={imageAlt || name}
            loading="lazy"
          />
        ) : (
          <div className="category-symbol" aria-hidden="true">
            {symbol}
          </div>
        )}

        <span className="category-card-badge">{name}</span>
      </div>

      <div className="category-card-content">
        <h3>{name}</h3>

        <p>{description}</p>

        <a
          className="category-link"
          href={`/categories?category=${encodeURIComponent(name)}`}
        >
          Explore category <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  )
}

export default CategoryCard
