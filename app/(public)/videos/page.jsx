import { RESTAURANT } from '@/lib/restaurant-info';
import { getPublicVideos } from '@/lib/public-content';
import VideoPlayer from '@/components/public/video-player';

export const metadata = {
  title: 'Videos',
  description: `Videos from ${RESTAURANT.name} — kitchen and counter clips.`,
  alternates: { canonical: '/videos' },
};

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  const videos = await getPublicVideos();

  return (
    <div className="dsp-wrap py-10">
      <h1 className="dsp-display font-bold text-2xl sm:text-3xl mb-2" style={{ color: 'var(--dsp-ink)' }}>
        {videos.heading}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--dsp-muted)' }}>{videos.lead}</p>

      {!videos.items.length ? (
        <p className="rounded-2xl border px-5 py-10 text-center text-sm" style={{ borderColor: 'var(--dsp-border)', color: 'var(--dsp-muted)', background: 'var(--dsp-surface)' }}>
          Videos coming soon.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {videos.items.map((v, i) => (
            <figure key={`${v.url}-${i}`} className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--dsp-border)', background: 'var(--dsp-surface)' }}>
              <div className="relative aspect-video min-h-[220px] bg-black sm:min-h-[280px]">
                <VideoPlayer url={v.url} title={v.title || 'Dim Sum Puri video'} />
              </div>
              {(v.title || v.description) && (
                <figcaption className="px-4 py-3">
                  {v.title ? (
                    <p className="font-semibold text-sm" style={{ color: 'var(--dsp-ink)' }}>{v.title}</p>
                  ) : null}
                  {v.description ? (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--dsp-muted)' }}>{v.description}</p>
                  ) : null}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
