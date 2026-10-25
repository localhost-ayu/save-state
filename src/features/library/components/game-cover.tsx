import Image from "next/image";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";

type Props = {
  title: string;
  coverUrl: string | null;
  customCoverPath?: string | null;
  platform?: string | null;
  sizes: string;
  className?: string;
  priority?: boolean;
};

function monogram(title: string) {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : title.slice(0, 2)).toUpperCase();
}

export function GameCover({ title, coverUrl, customCoverPath, platform, sizes, className, priority }: Props) {
  const src = customCoverPath ? mediaUrl(customCoverPath) : coverUrl;

  return (
    <div className={cn("@container relative aspect-[3/4] shrink-0 overflow-hidden bg-surface-raised", className)}>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[inherit] border border-dashed border-border-strong p-1 text-center">
          <span className="font-display text-[clamp(0.75rem,30cqw,2rem)] leading-none font-bold text-text">
            {monogram(title)}
          </span>
          {platform && <span className="hidden font-label text-[10px] text-muted @[3rem]:block">{platform}</span>}
        </div>
      )}
    </div>
  );
}
