/**
 * Cloudinary URL optimizer for Nigerian mobile networks.
 *
 * Cloudinary supports URL-based transformations. Instead of serving a raw
 * full-resolution image, we inject transformation parameters into the URL
 * to get a compressed, correctly-sized image.
 *
 * Example:
 *   Raw:  https://res.cloudinary.com/demo/image/upload/sample.jpg
 *   Opt:  https://res.cloudinary.com/demo/image/upload/w_80,h_80,c_fill,q_auto,f_auto/sample.jpg
 *
 * On mobile data this is the difference between 2MB and 8KB.
 */

type CloudinaryOptions = {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:low" | "auto:eco" | number;
  format?: "auto" | "webp" | "avif";
  crop?: "fill" | "fit" | "scale" | "thumb";
};

/**
 * Injects Cloudinary transformation parameters into an existing Cloudinary URL.
 * Returns the original URL unchanged if it's not a Cloudinary URL.
 */
export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  options: CloudinaryOptions = {}
): string {
  if (!url) return "";

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
  } = options;

  // Build transformation string
  const transforms: string[] = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);

  const transformStr = transforms.join(",");

  // Insert transformations after /upload/ in the URL
  return url.replace("/upload/", `/upload/${transformStr}/`);
}

// ── Pre-built presets for common use cases ────────────────────────────────────

/** 40×40 avatar for TopBar and table rows */
export const avatarSmall = (url: string) =>
  optimizeCloudinaryUrl(url, { width: 40, height: 40, quality: "auto:eco" });

/** 80×80 avatar for profile pages */
export const avatarMedium = (url: string) =>
  optimizeCloudinaryUrl(url, { width: 80, height: 80, quality: "auto:eco" });

/** Full-width image for clinical photos (max 800px wide) */
export const clinicalImage = (url: string) =>
  optimizeCloudinaryUrl(url, { width: 800, quality: "auto", format: "auto", crop: "fit" });

/** Thumbnail for image grids (150×150) */
export const imageThumbnail = (url: string) =>
  optimizeCloudinaryUrl(url, { width: 150, height: 150, quality: "auto:eco" });
