import "./AboutSection.css";

export default function AboutSection() {
  return (
    <section
      id="about-section"
      className="directory-about"
      aria-labelledby="about-heading"
    >
      <div className="directory-about__image">
        <img
          src="https://thekampalaguy.com/assets/hero-cleaning-Dnmhbl_n.png"
          alt="Professional cleaner working in a living room"
          loading="lazy"
        />
      </div>

      <div className="directory-about__content">
        <p className="directory-about__eyebrow">ABOUT US</p>
        <h2 id="about-heading">How Skillz Directory helps.</h2>
        <p>
          Skillz Directory connects residents with local service providers.
          Visitors can explore services, while registered residents can contact
          providers through the system.
        </p>

        <h3>For residents and visitors</h3>
        <ul className="directory-about__features">
          <li>Search services and filter providers by service type and area.</li>
          <li>See provider information, locations, ratings, and reviews.</li>
          <li>
            Create an account or sign in to start a conversation with a provider.
          </li>
        </ul>

        <div className="directory-about__contact">
          <h3>Need help with the system?</h3>
          <p>
            Contact Skillz Directory by WhatsApp at <strong>0991917168</strong>{" "}
            or email <strong>SkillzDirectory@gmail.com</strong>.
          </p>
          <div className="directory-about__actions">
            <a
              href="https://wa.me/265991917168"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Skillz Directory
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=SkillzDirectory%40gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Email with Gmail
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
