"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { getApiErrorMessage } from "@/services/api";
import { getHeroImage, saveHeroSettings } from "@/services/heroService";

const DEFAULT_HEADING = "Women with heritage. Chosen for your moment.";
const DEFAULT_DESCRIPTION =
  "Discover timeless silk sarees rooted in craftsmanship, reimagined for the way you celebrate today.";
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function getUploadErrorMessage(error) {
  if (error.response?.status === 502) {
    return "Image storage could not save the hero image. Please try again later or contact support.";
  }
  if (error.response?.status === 503) {
    return "Image storage is not configured or is unavailable. Please contact support.";
  }
  return getApiErrorMessage(error);
}

export default function HeroManager() {
  const fileInputRef = useRef(null);
  const [hero, setHero] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [heading, setHeading] = useState(DEFAULT_HEADING);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    getHeroImage()
      .then((data) => {
        if (!mounted) return;
        setHero(data);
        setPreviewUrl(data?.image_url || "");
        setHeading(data?.heading || DEFAULT_HEADING);
        setDescription(data?.description || DEFAULT_DESCRIPTION);
      })
      .catch((requestError) => {
        console.error("Hero image loading error:", requestError);
        if (mounted) setError(getUploadErrorMessage(requestError));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setSelectedFile(null);
      setPreviewUrl(hero?.image_url || "");
      setError("Choose a JPEG, PNG, WebP, or AVIF image.");
      event.target.value = "";
      return;
    }
    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      setSelectedFile(null);
      setPreviewUrl(hero?.image_url || "");
      setError("The image must be larger than 0 bytes and no bigger than 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function cancelChanges() {
    setSelectedFile(null);
    setPreviewUrl(hero?.image_url || "");
    setHeading(hero?.heading || DEFAULT_HEADING);
    setDescription(hero?.description || DEFAULT_DESCRIPTION);
    setError("");
    setSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function saveChanges() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const updatedHero = await saveHeroSettings({
        heading,
        description,
        image: selectedFile,
      });
      setHero(updatedHero);
      setPreviewUrl(updatedHero?.image_url || "");
      setHeading(updatedHero?.heading || DEFAULT_HEADING);
      setDescription(updatedHero?.description || DEFAULT_DESCRIPTION);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("Homepage hero image updated successfully.");
    } catch (requestError) {
      console.error("Hero image upload error:", requestError);
      setError(getUploadErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="hero-image-manager">
      <header className="hero-image-heading">
        <div>
          <span className="admin-eyebrow">HOMEPAGE CONTENT</span>
          <h1>Hero Image</h1>
          <p>Update the single image displayed in the homepage hero.</p>
        </div>
        {hero?.is_active && (
          <span className="hero-image-status">Currently active</span>
        )}
      </header>

      {error && (
        <div className="hero-image-alert error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="hero-image-alert success" role="status">
          {success}
        </div>
      )}

      <div className="hero-image-card">
        <div className="hero-image-preview">
          {loading ? (
            <div className="hero-image-placeholder" role="status">
              Loading hero image...
            </div>
          ) : previewUrl ? (
            <Image
              src={previewUrl}
              alt="Homepage hero image preview"
              fill
              sizes="(max-width: 760px) 100vw, 65vw"
              unoptimized
              priority
            />
          ) : (
            <div className="hero-image-placeholder">
              No hero image is set. Choose an image to add one.
            </div>
          )}
          {!loading && previewUrl && (
            <>
              <div className="hero-image-preview-shade" />
              <div className="hero-image-preview-copy">
                <span>South Indian Silk · Curated with Care</span>
                <strong>{heading || DEFAULT_HEADING}</strong>
                <p>{description || DEFAULT_DESCRIPTION}</p>
              </div>
            </>
          )}
        </div>

        <div className="hero-image-controls">
          <div>
            <h2>Homepage preview</h2>
            <p>
              Edit the copy shown over the hero image. The preview updates as you
              type or choose a new image.
            </p>
          </div>

          <input
            ref={fileInputRef}
            className="hero-image-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            disabled={loading || saving}
            aria-label="Choose a replacement hero image"
          />
          <button
            className="hero-image-update-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || saving}
          >
            Update Image
          </button>

          <p className="hero-image-file-guidance">
            JPEG, PNG, WebP, or AVIF · Maximum size 10 MB
          </p>

          {selectedFile && (
            <p className="hero-image-selected-file">
              Selected file: <strong>{selectedFile.name}</strong>
            </p>
          )}

          <label className="hero-image-field">
            Hero Heading
            <textarea
              value={heading}
              onChange={(event) => {
                setHeading(event.target.value);
                setError("");
                setSuccess("");
              }}
              maxLength={160}
              rows={2}
              disabled={loading || saving}
              required
            />
          </label>
          <label className="hero-image-field">
            Bottom Paragraph
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setError("");
                setSuccess("");
              }}
              maxLength={2000}
              rows={4}
              disabled={loading || saving}
              required
            />
          </label>

          <div className="hero-image-actions">
            <button
              className="hero-image-save-button"
              type="button"
              onClick={saveChanges}
              disabled={loading || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="hero-image-cancel-button"
              type="button"
              onClick={cancelChanges}
              disabled={loading || saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
