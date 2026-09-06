import { useState } from "react";
import "./ImageUpload.css";

// Uploads a file straight from the browser to Cloudinary's free tier and
// calls onUploaded with the resulting public URL. No backend storage needed.
export default function ImageUpload({ imageUrl, onUploaded, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      onUploaded(data.secure_url);
    } catch (err) {
      setError("Couldn't upload that image. Try again.");
    } finally {
      setUploading(false);
    }
  }

  if (imageUrl) {
    return (
      <div className="image-upload">
        <div className="image-preview-wrap">
          <img
            src={imageUrl}
            alt="Attached to post"
            className="image-preview"
          />
          <button
            type="button"
            className="image-remove-btn"
            onClick={onRemove}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="image-upload">
      <label
        className="image-upload-btn"
        style={{ cursor: "pointer", display: "inline-block" }}
      >
        {uploading ? "Uploading…" : "+ Add a photo"}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>
      {error && (
        <p
          className="image-upload-status"
          style={{ color: "var(--stamp-red)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
