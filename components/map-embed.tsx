interface MapEmbedProps {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
}

export function MapEmbed({ eyebrow, title, sub, cta }: MapEmbedProps) {
  return (
    <section className="py-16 md:py-24 bg-bg-2">
      <div className="container-page">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="display-lg mt-5">{title}</h2>
        <p className="mt-3 text-ink-2 max-w-xl">{sub}</p>
        <div className="mt-8 rounded-2xl overflow-hidden border border-line shadow-warmLg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096!2d105.799!3d21.028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAyJzAyLjQiTiAxMDXCsDQ3JzU2LjQiRQ!5e0!3m2!1sen!2s!4v1"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="AME Marketing Office"
          />
        </div>
        <a
          href="https://www.google.com/maps/search/?api=1&query=Gemek+1+Tower+An+Khanh+Hanoi"
          target="_blank"
          rel="noopener"
          className="btn-primary-soft mt-6 inline-flex items-center gap-2"
        >
          {cta}
        </a>
      </div>
    </section>
  );
}
