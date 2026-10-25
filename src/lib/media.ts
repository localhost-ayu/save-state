import { publicEnv } from "@/lib/env";

export const MEDIA_BUCKET = "media";

export function mediaUrl(path: string) {
  return `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

export function isOwnMediaPath(userId: string, path: string, folder: string) {
  return path.startsWith(`${userId}/${folder}/`) && !path.includes("..");
}
