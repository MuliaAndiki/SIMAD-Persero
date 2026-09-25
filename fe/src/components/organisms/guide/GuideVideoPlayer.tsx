'use client';

import { Play, Video } from 'lucide-react';
import React from 'react';

interface GuideVideoPlayerProps {
  url: string | null;
  title?: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      if (parsed.pathname.startsWith('/embed/')) return url;
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
  } catch {
    // If not a valid URL or regex matching needed
  }
  return null;
}

export function GuideVideoPlayer({ url, title = 'Video Panduan' }: GuideVideoPlayerProps) {
  if (!url) return null;

  const ytEmbed = getYouTubeEmbedUrl(url);

  return (
    <div className="overflow-hidden rounded-xl border bg-black/5 dark:bg-black/40 shadow-sm">
      <div className="aspect-video w-full">
        {ytEmbed ? (
          <iframe
            src={ytEmbed}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <video controls className="h-full w-full object-cover">
            <source src={url} />
            <track kind="captions" />
            Browser Anda tidak mendukung pemutar video HTML5.
          </video>
        )}
      </div>
    </div>
  );
}
