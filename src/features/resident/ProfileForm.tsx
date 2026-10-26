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
    <form onSubmit={onSubmit} noValidate aria-label="Edit profile" className="row g-4">
      {serverError && (
        <div className="col-12">
          <div className="alert-error" role="alert">{serverError}</div>
        </div>
      )}

      {/* Avatar upload */}
      <div className="col-12">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={values.fullName || user.fullName} imageUrl={avatarPreview} size={88} />
          <div>
            <label htmlFor="profile-avatar" className="btn btn-trade btn-sm mb-0">
              <Camera /> {avatarPreview ? "Change photo" : "Add photo"}
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
      </div>

      <div className="col-12 col-md-6">
        <div className="form-field">
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            type="text"
            className={errors.fullName ? "is-invalid" : ""}
            value={values.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            autoComplete="name"
            disabled={busy}
            required
          />
          {errors.fullName && <div className="invalid-feedback d-block">{errors.fullName}</div>}
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="form-field">
          <label htmlFor="profile-display">Display name</label>
          <input
            id="profile-display"
            type="text"
            className={errors.displayName ? "is-invalid" : ""}
            value={values.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            maxLength={MAX_DISPLAY_NAME_LENGTH}
            placeholder="How you'd like to be addressed"
            disabled={busy}
          />
          {errors.displayName && <div className="invalid-feedback d-block">{errors.displayName}</div>}
        </div>
      </div>

      <div className="col-12">
        <div className="form-field">
          <label htmlFor="profile-bio">About you</label>
          <textarea
            id="profile-bio"
            rows={4}
            className={errors.bio ? "is-invalid" : ""}
            value={values.bio}
            onChange={(e) => update("bio", e.target.value)}
            maxLength={MAX_BIO_LENGTH}
            placeholder="A short bio — who you are, what you do, anything you'd like the community to know."
            disabled={busy}
          />
          {errors.bio && <div className="invalid-feedback d-block">{errors.bio}</div>}
          <div className="form-text">{values.bio.length}/{MAX_BIO_LENGTH} characters</div>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="form-field">
          <label htmlFor="profile-location">Location</label>
          <input
            id="profile-location"
            type="text"
            className={errors.location ? "is-invalid" : ""}
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            maxLength={MAX_LOCATION_LENGTH}
            placeholder="Area 25, Lilongwe"
            disabled={busy}
          />
          {errors.location && <div className="invalid-feedback d-block">{errors.location}</div>}
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="form-field">
          <label htmlFor="profile-occupation">Occupation</label>
          <input
            id="profile-occupation"
            type="text"
            className={errors.occupation ? "is-invalid" : ""}
            value={values.occupation}
            onChange={(e) => update("occupation", e.target.value)}
            maxLength={MAX_OCCUPATION_LENGTH}
            placeholder="Teacher, student, engineer…"
            disabled={busy}
          />
          {errors.occupation && <div className="invalid-feedback d-block">{errors.occupation}</div>}
        </div>
      </div>

      <div className="col-12">
        <div className="form-field">
          <label htmlFor="profile-languages">Languages</label>
          <input
            id="profile-languages"
            type="text"
            value={values.languages}
            onChange={(e) => update("languages", e.target.value)}
            placeholder="English, Chichewa, Tumbuka (comma-separated)"
            disabled={busy}
          />
          <div className="form-text">Separate multiple languages with commas.</div>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="form-field">
          <label htmlFor="profile-phone">Phone number</label>
          <input
            id="profile-phone"
            type="tel"
            className={errors.phone ? "is-invalid" : ""}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
            placeholder="+265 ..."
            disabled={busy}
          />
          {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="form-field">
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" type="email" value={user.email} readOnly disabled />
          <div className="form-text">Email cannot be changed here.</div>
        </div>
      </div>

      <div className="col-12 d-flex gap-2 pt-2">
        <button type="submit" className="btn btn-athletic" disabled={busy}>
          {saving && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
          Save changes
        </button>
        <button type="button" className="btn btn-trade" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}