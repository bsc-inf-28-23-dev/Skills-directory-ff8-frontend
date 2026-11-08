import { useState, type FormEvent, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import Avatar from "../../components/Avatar";
import { updateResidentProfile, uploadAvatar } from "../../services/residentService";
import type { ApiError, User } from "../../types";
import {
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_OCCUPATION_LENGTH,
  validateProfile,
  type ProfileValues,
} from "../../utils/validation";

interface Props {
  user: User;
  onSaved: (user: User) => void;
  onCancel: () => void;
}

export default function ProfileForm({ user, onSaved, onCancel }: Props) {
  const [values, setValues] = useState<ProfileValues>({
    fullName: user.fullName ?? "",
    displayName: user.displayName ?? "",
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
    occupation: user.occupation ?? "",
    languages: (user.languages ?? []).join(", "),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileValues, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const update = <K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const onPickAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveAvatarIfPicked = async (): Promise<User | null> => {
    if (!avatarFile) return null;
    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(avatarFile);
      return updated;
    } catch (err) {
      setAvatarError((err as ApiError).message);
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const found = validateProfile(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const afterAvatar = await saveAvatarIfPicked();
      if (avatarFile && !afterAvatar) {
        return;
      }

      const languages = values.languages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await updateResidentProfile({
        fullName: values.fullName.trim(),
        displayName: values.displayName.trim() || undefined,
        phone: values.phone.trim() || undefined,
        bio: values.bio.trim() || undefined,
        location: values.location.trim() || undefined,
        occupation: values.occupation.trim() || undefined,
        languages: languages.length ? languages : undefined,
      });

      onSaved({ ...updated, avatarUrl: afterAvatar?.avatarUrl ?? updated.avatarUrl });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...apiError.fieldErrors }));
      }
      setServerError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploadingAvatar;

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Edit profile" style={{ textAlign: "left", maxWidth: 600 }}>
      {serverError && (
        <div className="alert-error mb-3" role="alert">{serverError}</div>
      )}

      {/* Avatar upload */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Avatar name={values.fullName || user.fullName} imageUrl={avatarPreview} size={88} />
        <div>
          <label htmlFor="profile-avatar" className="btn btn-trade btn-sm mb-0">
            <Camera size={16} className="me-1" /> {avatarPreview ? "Change photo" : "Add photo"}
          </label>
          <input
            id="profile-avatar"
            type="file"
            accept="image/*"
            onChange={onPickAvatar}
            disabled={busy}
            hidden
          />
          <div className="form-text mt-1">JPG or PNG, up to 5 MB.</div>
          {avatarError && <div className="invalid-feedback d-block">{avatarError}</div>}
          {uploadingAvatar && (
            <div className="form-text mt-1">
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              Uploading…
            </div>
          )}
        </div>
      </div>

      {/* Full Name */}
      <div className="form-field mb-3">
        <label htmlFor="profile-name" style={{ textAlign: "left" }}>Full name</label>
        <input
          id="profile-name"
          type="text"
          className={errors.fullName ? "is-invalid" : ""}
          value={values.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          autoComplete="name"
          disabled={busy}
          required
          style={{ textAlign: "left" }}
        />
        {errors.fullName && <div className="invalid-feedback d-block">{errors.fullName}</div>}
      </div>

      {/* Display Name */}
      <div className="form-field mb-3">
        <label htmlFor="profile-display" style={{ textAlign: "left" }}>Display name</label>
        <input
          id="profile-display"
          type="text"
          className={errors.displayName ? "is-invalid" : ""}
          value={values.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          maxLength={MAX_DISPLAY_NAME_LENGTH}
          placeholder="How you'd like to be addressed"
          disabled={busy}
          style={{ textAlign: "left" }}
        />
        {errors.displayName && <div className="invalid-feedback d-block">{errors.displayName}</div>}
      </div>

      {/* About You */}
      <div className="form-field mb-3">
        <label htmlFor="profile-bio" style={{ textAlign: "left" }}>About you</label>
        <textarea
          id="profile-bio"
          rows={4}
          className={errors.bio ? "is-invalid" : ""}
          value={values.bio}
          onChange={(e) => update("bio", e.target.value)}
          maxLength={MAX_BIO_LENGTH}
          placeholder="A short bio — who you are, what you do, anything you'd like the community to know."
          disabled={busy}
          style={{ textAlign: "left" }}
        />
        {errors.bio && <div className="invalid-feedback d-block">{errors.bio}</div>}
        <div className="form-text text-start">{values.bio.length}/{MAX_BIO_LENGTH} characters</div>
      </div>

      {/* Location */}
      <div className="form-field mb-3">
        <label htmlFor="profile-location" style={{ textAlign: "left" }}>Location</label>
        <input
          id="profile-location"
          type="text"
          className={errors.location ? "is-invalid" : ""}
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
          maxLength={MAX_LOCATION_LENGTH}
          placeholder="Area 25, Lilongwe"
          disabled={busy}
          style={{ textAlign: "left" }}
        />
        {errors.location && <div className="invalid-feedback d-block">{errors.location}</div>}
      </div>

      {/* Occupation */}
      <div className="form-field mb-3">
        <label htmlFor="profile-occupation" style={{ textAlign: "left" }}>Occupation</label>
        <input
          id="profile-occupation"
          type="text"
          className={errors.occupation ? "is-invalid" : ""}
          value={values.occupation}
          onChange={(e) => update("occupation", e.target.value)}
          maxLength={MAX_OCCUPATION_LENGTH}
          placeholder="Teacher, student, engineer…"
          disabled={busy}
          style={{ textAlign: "left" }}
        />
        {errors.occupation && <div className="invalid-feedback d-block">{errors.occupation}</div>}
      </div>

      {/* Languages */}
      <div className="form-field mb-3">
        <label htmlFor="profile-languages" style={{ textAlign: "left" }}>Languages</label>
        <input
          id="profile-languages"
          type="text"
          value={values.languages}
          onChange={(e) => update("languages", e.target.value)}
          placeholder="English, Chichewa, Tumbuka (comma-separated)"
          disabled={busy}
          style={{ textAlign: "left" }}
        />
        <div className="form-text text-start">Separate multiple languages with commas.</div>
      </div>

      {/* Phone */}
      <div className="form-field mb-3">
        <label htmlFor="profile-phone" style={{ textAlign: "left" }}>Phone number</label>
        <input
          id="profile-phone"
          type="tel"
          className={errors.phone ? "is-invalid" : ""}
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          autoComplete="tel"
          placeholder="+265 ..."
          disabled={busy}
          style={{ textAlign: "left" }}
        />
        {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
      </div>

      {/* Email */}
      <div className="form-field mb-4">
        <label htmlFor="profile-email" style={{ textAlign: "left" }}>Email</label>
        <input 
          id="profile-email" 
          type="email" 
          value={user.email} 
          readOnly 
          disabled 
          style={{ textAlign: "left" }}
        />
        <div className="form-text text-start">Email cannot be changed here.</div>
      </div>

      <div className="d-flex gap-2 pt-3 border-top mt-4">
        <button type="submit" className="btn btn-athletic" disabled={busy}>
          {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          Save changes
        </button>
        <button type="button" className="btn btn-trade" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}