/**
 * Switches for pages owned by other parts of the project.
 * While a flag is false, links to that page are shown as disabled with a note
 * instead of pointing at a route that does not exist yet.
 * Set each to true when the matching page is merged and its route is registered.
 */
export const FEATURES = {
  /** /services (Find Services page) */
  searchPage: false,
  /** /messages (conversation list and chat) */
  messaging: false,
  /** /providers/:providerId (full provider profile page) */
  providerProfilePage: false,
};
