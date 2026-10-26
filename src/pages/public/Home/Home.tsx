import { useState, type FormEvent } from 'react'
import './Home.css'

// IMPORTANT: Change this if your teammate uses a different route.
const SERVICES_PAGE = '/services'

type FeatureIconName = 'location' | 'shield' | 'star' | 'leaf'

function FeatureIcon({ name }: { name: FeatureIconName }) {
  return (
    <svg
      className="feature-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'location' && (
        <>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      )}

      {name === 'shield' && (
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      )}

      {name === 'star' && (
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      )}

      {name === 'leaf' && (
        <>
          <path d="M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-6 11-16Z" />
          <path d="M3 21c3-5 7-8 12-11" />
        </>
      )}
    </svg>
  )
}

function Home() {
  const [location, setLocation] = useState('')
  const [showMoreAbout, setShowMoreAbout] = useState(false)

  function handleLocationSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = location.trim()

    if (!query) return

    const params = new URLSearchParams({ location: query })

    window.location.href = `${SERVICES_PAGE}?${params.toString()}`
  }

  return (
    <main className="home-page">
      {/* Navigation */}
      <header className="home-header">
        <a className="brand" href="/" aria-label="Skillz Directory home">
          <span className="brand-mark">SD</span>

          <span className="brand-text">
            <span>
              Skillz <strong>Directory</strong>
            </span>
            <small>Connecting residents with service providers</small>
          </span>
        </a>

        <nav className="home-nav" aria-label="Main navigation">
          <a className="nav-active" href="/">
            Home
          </a>

          <a href={SERVICES_PAGE}>
            Categories
          </a>

          <a href="#about-section">
            About
          </a>

          <a className="nav-login" href="/login">
            Login
          </a>
        </nav>
      </header>

      {/* Hero and location search */}
      <section className="home-hero">
        <div className="hero-content">
          <p className="hero-label">
            YOUR LOCAL SERVICE DIRECTORY
          </p>

          <h1>
            Find the right
            <br />
            professional
            <span> for the job.</span>
          </h1>

          <p className="hero-description">
            Need a reliable plumber, electrician, mechanic or cleaner?
            Skillz Directory connects you with service providers in
            your area, quickly and easily.
          </p>

          <form
            className="location-search"
            onSubmit={handleLocationSearch}
          >
            <label
              className="visually-hidden"
              htmlFor="location-search"
            >
              Enter your location
            </label>

            <span className="location-search-icon" aria-hidden="true">
              <FeatureIcon name="location" />
            </span>

            <input
              id="location-search"
              type="text"
              placeholder="Enter your location (e.g. Zomba, Blantyre, Lilongwe)"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              autoComplete="address-level2"
              required
            />

            <button type="submit">
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>

              <span>Explore Services</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>

        <div className="hero-image">
          <img
            src="https://images.pexels.com/photos/4439588/pexels-photo-4439588.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Professional mechanic working in a vehicle workshop"
            fetchPriority="high"
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="home-benefits" aria-label="Benefits of Skillz Directory">
        <article className="benefit-item">
          <div className="benefit-icon">
            <FeatureIcon name="location" />
          </div>

          <h2>Find a Service</h2>

          <p>
            Search by location to find service providers in your area.
          </p>
        </article>

        <article className="benefit-item">
          <div className="benefit-icon">
            <FeatureIcon name="shield" />
          </div>

          <h2>Trusted Professionals</h2>

          <p>
            Find professionals offering services in your community.
          </p>
        </article>

        <article className="benefit-item">
          <div className="benefit-icon">
            <FeatureIcon name="star" />
          </div>

          <h2>Quality Services</h2>

          <p>
            Discover skilled people who can help with your needs.
          </p>
        </article>

        <article className="benefit-item">
          <div className="benefit-icon">
            <FeatureIcon name="leaf" />
          </div>

          <h2>Support Local</h2>

          <p>
            Help local service providers connect with their communities.
          </p>
        </article>
      </section>

      {/* About section */}
      <section
        id="about-section"
        className="home-about"
        aria-labelledby="about-heading"
      >
        <div className="about-image">
          <img
            src="https://thekampalaguy.com/assets/hero-cleaning-Dnmhbl_n.png"
            alt="Professional cleaner working in a living room"
            loading="lazy"
          />
        </div>

        <div className="about-content">
          <p className="section-label">ABOUT US</p>

          <h2 id="about-heading">
            Connecting residents
            <br />
            with local professionals.
          </h2>

          <p>
            Skillz Directory is a community-based platform that makes
            it easy for households to discover service providers,
            from electricians and plumbers to mechanics, carpenters,
            painters and cleaners.
          </p>

          {showMoreAbout && (
            <p className="about-extra">
              Our goal is to make finding local services simpler by
              helping residents discover professionals working in
              their areas.
            </p>
          )}

          <button
            type="button"
            className="about-learn-more"
            onClick={() => setShowMoreAbout((previous) => !previous)}
            aria-expanded={showMoreAbout}
          >
            {showMoreAbout ? 'Show Less' : 'Learn More'}
            <span aria-hidden="true">
              {showMoreAbout ? ' ↑' : ' →'}
            </span>
          </button>
        </div>
      </section>

      {/* Service provider call-to-action */}
      <section className="home-callout">
        <div className="provider-icon" aria-hidden="true">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 25V16a14 14 0 0 1 28 0v9" />
            <path d="M14 21h36v11a18 18 0 0 1-36 0V21Z" />
            <path d="M24 39v7l8 6 8-6v-7" />
            <path d="M20 47 10 52a8 8 0 0 0-4 7v2h52v-2a8 8 0 0 0-4-7l-10-5" />
            <path d="M32 52v9" />
          </svg>
        </div>

        <div className="callout-content">
          <h2>Are you a service provider?</h2>

          <p>
            Reach more customers in your area and grow your business
            with Skillz Directory.
          </p>
        </div>

        <a className="callout-button" href="/register">
          Get Started <span aria-hidden="true">→</span>
        </a>
      </section>

      {/* Simple footer */}
      <footer className="home-footer">
        <a className="brand footer-brand" href="/">
          <span className="brand-mark">SD</span>

          <span className="brand-text">
            <span>
              Skillz <strong>Directory</strong>
            </span>

            <small>Connecting residents with service providers.</small>
          </span>
        </a>

        <p className="copyright">
          © {new Date().getFullYear()} Skillz Directory. All rights reserved.
        </p>
      </footer>
    </main>
  )
}

export default Home