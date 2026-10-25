import Image from "next/image";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";

type Props = {
  title: string;
  coverUrl: string | null;
  customCoverPath?: string | null;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function GameCover({ title, coverUrl, customCoverPath, sizes, className, priority }: Props) {
  const src = customCoverPath ? mediaUrl(customCoverPath) : coverUrl;

  return (
    <div className={cn("relative aspect-[3/4] shrink-0 overflow-hidden bg-surface-raised", className)}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={Boolean(customCoverPath)}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center font-display text-2xl font-bold text-muted">
          {title.slice(0, 1)}
        </div>
      )}
    </div>
  );
}
