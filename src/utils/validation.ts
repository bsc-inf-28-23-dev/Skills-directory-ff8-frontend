// ============================================================
// Shared form validation helpers
// ============================================================

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 1000;
export const MAX_BIO_LENGTH = 500;
export const MAX_DISPLAY_NAME_LENGTH = 40;
export const MAX_OCCUPATION_LENGTH = 80;
export const MAX_LOCATION_LENGTH = 120;

/** Accepts international (+265...) or local numbers with optional spaces/dashes. */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  return /^\+?\d{7,15}$/.test(digits);
}

// ---------- Profile ----------

export interface ProfileValues {
  fullName: string;
  displayName: string;
  phone: string;
  bio: string;
  location: string;
  occupation: string;
  languages: string;
}

export function validateProfile(
  values: ProfileValues,
): Partial<Record<keyof ProfileValues, string>> {
  const errors: Partial<Record<keyof ProfileValues, string>> = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  if (values.displayName.trim().length > MAX_DISPLAY_NAME_LENGTH) {
    errors.displayName = `Display name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters.`;
  }

  if (values.phone.trim() && !isValidPhone(values.phone)) {
    errors.phone = "Enter a valid phone number, for example +265 999 000 000.";
  }

  if (values.bio.trim().length > MAX_BIO_LENGTH) {
    errors.bio = `Bio must be at most ${MAX_BIO_LENGTH} characters.`;
  }

  if (values.location.trim().length > MAX_LOCATION_LENGTH) {
    errors.location = `Location must be at most ${MAX_LOCATION_LENGTH} characters.`;
  }

  if (values.occupation.trim().length > MAX_OCCUPATION_LENGTH) {
    errors.occupation = `Occupation must be at most ${MAX_OCCUPATION_LENGTH} characters.`;
  }

  return errors;
}

// ---------- Review ----------

export function validateReview(values: { rating: number; text: string }): {
  rating?: string;
  text?: string;
} {
  const errors: { rating?: string; text?: string } = {};
  if (values.rating < 1 || values.rating > 5) {
    errors.rating = "Please choose a rating from 1 to 5 stars.";
  }
  const length = values.text.trim().length;
  if (length < MIN_REVIEW_LENGTH) {
    errors.text = `Please write at least ${MIN_REVIEW_LENGTH} characters.`;
  } else if (length > MAX_REVIEW_LENGTH) {
    errors.text = `Reviews are limited to ${MAX_REVIEW_LENGTH} characters.`;
  }
  return errors;
}

// ---------- Register ----------

export interface RegisterValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "resident" | "provider";
  serviceCategory: string;
}

export function validateRegister(
  values: RegisterValues,
): Partial<Record<keyof RegisterValues, string>> {
  const errors: Partial<Record<keyof RegisterValues, string>> = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.phone.trim() && !isValidPhone(values.phone)) {
    errors.phone = "Enter a valid phone number, for example +265 999 000 000.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (values.role === "provider" && !values.serviceCategory.trim()) {
    errors.serviceCategory = "Please select a service category.";
  }

  return errors;
}