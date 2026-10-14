
import './CategoryCard.css'

type CategoryCardProps = {
  name: string
  description: string
  symbol: string
}

function CategoryCard({
  name,
  description,
  symbol,
}: CategoryCardProps) {
  return (
    <article className="category-card">
      <div className="category-symbol" aria-hidden="true">
        {symbol}
      </div>

      <h3>{name}</h3>
      <p>{description}</p>

      <a
        className="category-link"
        href={`/categories?category=${encodeURIComponent(name)}`}
      >
        Explore category <span aria-hidden="true">→</span>
      </a>
    </article>
  )
}

export default CategoryCard
