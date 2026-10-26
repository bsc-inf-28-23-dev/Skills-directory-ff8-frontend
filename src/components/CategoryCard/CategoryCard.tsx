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
            decoding="async"
          />
        ) : (
          <div className="category-image-fallback">
            {symbol}
          </div>
        )}
      </div>

      <div className="category-card-content">
        <div className="category-card-title">
          <span className="category-symbol" aria-hidden="true">
            {symbol}
          </span>

          <h3>{name}</h3>
        </div>

        <p>{description}</p>
      </div>
    </article>
  )
}

export default CategoryCard