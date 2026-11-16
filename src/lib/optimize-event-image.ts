const MAX_EVENT_IMAGE_DIMENSION = 1920;
const WEBP_QUALITY = 0.82;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);

export function getResizedImageDimensions(
  width: number,
  height: number,
  maxDimension = MAX_EVENT_IMAGE_DIMENSION,
) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    !Number.isFinite(maxDimension) ||
    maxDimension <= 0
  ) {
    throw new Error("Image dimensions are invalid.");
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function optimizeEventImage(file: File): Promise<File> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Choose a JPG, JPEG, or PNG image.");
  }

  if (typeof createImageBitmap !== "function") {
    throw new Error("Image optimization is not supported in this browser.");
  }

  const image = await createImageBitmap(file);

  try {
    const dimensions = getResizedImageDimensions(image.width, image.height);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not prepare the image for optimization.");
    }

    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);

    const webpBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/webp", WEBP_QUALITY);
    });

    const outputType = webpBlob?.type === "image/webp" ? "image/webp" : file.type;
    let outputBlob = webpBlob?.type === "image/webp" ? webpBlob : null;
    if (!outputBlob) {
      outputBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, outputType, WEBP_QUALITY);
      });
    }

    if (!outputBlob || outputBlob.type !== outputType) {
      throw new Error("Could not convert the image to a supported format.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "event-poster";
    const extension =
      outputBlob.type === "image/webp" ? "webp" : file.type === "image/jpeg" ? "jpg" : "png";
    return new File([outputBlob], `${baseName}.${extension}`, {
      type: outputBlob.type,
      lastModified: Date.now(),
    });
  } finally {
    image.close();
  }
}
