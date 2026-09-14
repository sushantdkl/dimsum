/** Resolve YouTube / Vimeo / direct file URLs for the public videos page. */

function youtubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
      return u.searchParams.get('v');
    }
  } catch {
    /* ignore */
  }
  return null;
}

function vimeoId(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('vimeo.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    const id = parts.find((p) => /^\d+$/.test(p));
    return id || null;
  } catch {
    return null;
  }
}

export function resolveVideoSource(url) {
  const raw = String(url || '').trim();
  if (!raw) return { kind: 'empty' };
  const yt = youtubeId(raw);
  if (yt) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt}` };
  const vim = vimeoId(raw);
  if (vim) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vim}` };
  return { kind: 'file', src: raw };
}

export default function VideoPlayer({ url, title }) {
  const source = resolveVideoSource(url);
  if (source.kind === 'empty') return null;

  if (source.kind === 'youtube' || source.kind === 'vimeo') {
    return (
      <iframe
        src={source.src}
        title={title || 'Video'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        style={{ border: 0 }}
      />
    );
  }

  return (
    <video
      src={source.src}
      controls
      playsInline
      preload="metadata"
      className="absolute inset-0 h-full w-full bg-black object-contain"
      title={title || 'Video'}
    >
      <track kind="captions" />
    </video>
  );
}
