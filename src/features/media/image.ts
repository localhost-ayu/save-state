import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/media";

export type CropArea = { x: number; y: number; width: number; height: number };

const OUTPUT_TYPE = "image/webp";
const OUTPUT_QUALITY = 0.88;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível ler a imagem"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem"))),
      OUTPUT_TYPE,
      OUTPUT_QUALITY,
    ),
  );
}

export async function cropImage(src: string, area: CropArea, maxWidth: number) {
  const image = await loadImage(src);
  const scale = Math.min(1, maxWidth / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  canvas.getContext("2d")!.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return { blob: await canvasToBlob(canvas), width: canvas.width, height: canvas.height };
}

export async function resizeImage(file: File, maxSide: number) {
  const src = URL.createObjectURL(file);
  try {
    const image = await loadImage(src);
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { blob: await canvasToBlob(canvas), width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(src);
  }
}

export async function uploadMedia(
  blob: Blob,
  folder: "covers" | "screenshots" | "avatars" | "banners" | "backgrounds",
) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");

  const path = `${data.user.id}/${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: OUTPUT_TYPE });
  if (error) throw new Error(error.message);
  return path;
}

export async function removeMedia(path: string) {
  await createClient().storage.from(MEDIA_BUCKET).remove([path]);
}
