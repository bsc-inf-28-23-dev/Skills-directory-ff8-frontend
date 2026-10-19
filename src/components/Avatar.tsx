import { initials } from "../utils/format";

interface Props {
  name: string;
  imageUrl?: string | null;
  size?: number;
}

export default function Avatar({ name, imageUrl, size = 44 }: Props) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        className="avatar-image flex-shrink-0"
        style={{ width: size, height: size, objectFit: "cover", borderRadius: 0 }}
      />
    );
  }

  return (
    <span
      className="avatar-initials flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42, borderRadius: 0 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}