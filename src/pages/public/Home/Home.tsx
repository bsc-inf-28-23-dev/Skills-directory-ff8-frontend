import { useState } from 'react'
import CategoryCard from '../../../components/CategoryCard/CategoryCard'
import './Home.css'

const categories = [
  {
    name: 'Mechanics',
    description:
      'Find professionals who help with vehicle repairs and maintenance.',
    symbol: 'M',
  },
  {
    name: 'Plumbers',
    description:
      'Find help with pipes, taps, water systems and plumbing repairs.',
    symbol: 'P',
  },
  {
    name: 'Electricians',
    description:
      'Find professionals for electrical installations and repairs.',
    symbol: 'E',
  },
  {
    name: 'Carpenters',
    description:
      'Find help with furniture, doors, woodwork and carpentry.',
    symbol: 'C',
  },
  {
    name: 'Painters',
    description:
      'Find professionals for painting and decorating projects.',
    symbol: 'P',
  },
  {
    name: 'Cleaners',
    description:
      'Find help with home and general cleaning services.',
    symbol: 'C',
  },
]

function Home() {
  const [search, setSearch] = useState('')
  const [showAbout, setShowAbout] = useState(false)

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = search.trim()

    if (!query) return

    window.location.href =
      '/search-results?search=' + encodeURIComponent(query)
  }

  function handleAboutClick() {
    setShowAbout((previous) => !previous)
  }

  return (
    <main className="home-page">
      <header className="home-header">
        <a
          className="brand"
          href="/"
          aria-label="Skills Directory home"
        >
          <span className="brand-mark">SD</span>
          <span>Skills Directory</span>
        </a>

        <nav className="home-nav" aria-label="Main navigation">
          <a className="nav-active" href="/">
            Home
          </a>

          <a href="#categories">Categories</a>

          <button
            type="button"
            className="nav-about"
            onClick={handleAboutClick}
            aria-expanded={showAbout}
            aria-controls="about-section"
          >
            About
          </button>

          <a className="nav-login" href="/login">
            Login
          </a>
        </nav>
      </header>

      {showAbout && (
        <section
          id="about-section"
          className="about-content"
          aria-labelledby="about-heading"
        >
          <h2 id="about-heading">About Us</h2>

          <p>
            We are a community-based platform bridging the gap
            between residents and service providers. Our goal is to
            make it easy for every household to find a trusted
            electrician, plumber, mechanic, and other professionals
            in minutes.
          </p>

          <button
            type="button"
            className="about-close"
            onClick={() => setShowAbout(false)}
          >
            Close
          </button>
        </section>
      )}

      <section className="home-hero">
        <div className="hero-content">
          <p className="hero-label">
            YOUR LOCAL SERVICE DIRECTORY
          </p>

          <h1>
            Find the right professional
            <span> for the job.</span>
          </h1>

          <p className="hero-description">
            Need a mechanic, plumber or electrician? Discover service
            providers and find the help you need in one convenient place.
          </p>

          <form className="home-search" onSubmit={handleSearch}>
            <label
              className="search-label"
              htmlFor="service-search"
            >
              Search for a service
            </label>

            <div className="search-controls">
              <input
                id="service-search"
                type="search"
                placeholder="e.g. plumber, mechanic..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button type="submit">Search</button>
            </div>
          </form>

          <p className="hero-hint">
            Browse categories below to find the service you need.
          </p>
        </div>
      </section>

      <section
        id="categories"
        className="featured-categories"
        aria-labelledby="categories-heading"
      >
        <div className="section-heading">
          <p className="section-label">FIND WHAT YOU NEED</p>

          <h2 id="categories-heading">
            Explore service categories
          </h2>

          <p className="section-description">
            Choose a category to discover the type of professional
            you are looking for.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              description={category.description}
              symbol={category.symbol}
            />
          ))}
        </div>
      </section>

      <section className="home-callout">
        <div>
          <h2>Are you a service provider?</h2>

          <p>
            Connect with residents who are looking for the services you offer.
          </p>
        </div>

        <a href="/register">Get started</a>
      </section>

      <footer className="home-footer">
        <a className="footer-brand" href="/">
          Skills Directory
        </a>

        <p>Connecting residents with service providers.</p>

        <p className="copyright">
          © {new Date().getFullYear()} Skills Directory
        </p>
      </footer>
    </main>
  )
}

export default Home