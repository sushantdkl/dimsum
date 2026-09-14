import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

function BannerLink({ href, className, children, label }) {
  if (!href) return <div className={className}>{children}</div>;
  if (/^https?:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>{children}</a>;
  }
  return <Link href={href} aria-label={label} className={className}>{children}</Link>;
}

export default function FestiveShowcase({ content }) {
  const items = content?.items || [];
  if (content?.visible === false || !items.length) return null;
  const headingId = 'festive-highlights-heading';

  return (
    <section className="dsp-festive" aria-labelledby={content.heading ? headingId : undefined} aria-label={content.heading ? undefined : 'Festive highlights'}>
      {(content.heading || content.lead) && (
        <div className="dsp-wrap dsp-festive-heading">
          <div>
            {content.heading ? <h2 id={headingId} className="dsp-display">{content.heading}</h2> : null}
            {content.lead ? <p>{content.lead}</p> : null}
          </div>
          {items.length > 1 ? <span aria-hidden>Swipe to explore →</span> : null}
        </div>
      )}

      <div className="dsp-festive-rail" data-single={items.length === 1 ? 'true' : 'false'} aria-label="Festive banners">
        {items.map((item, index) => (
          <BannerLink
            key={`${item.id || 'festive'}-${index}`}
            href={item.href}
            label={item.title || item.alt}
            className="dsp-festive-card dsp-focus"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.alt} loading="lazy" />
            {(item.eyebrow || item.title || item.linkLabel) && (
              <span className="dsp-festive-copy">
                {item.eyebrow ? <span className="dsp-festive-eyebrow">{item.eyebrow}</span> : null}
                {item.title ? <strong className="dsp-display">{item.title}</strong> : null}
                {item.linkLabel && item.href ? (
                  <span className="dsp-festive-link">{item.linkLabel}<ArrowUpRight aria-hidden /></span>
                ) : null}
              </span>
            )}
          </BannerLink>
        ))}
      </div>
    </section>
  );
}
