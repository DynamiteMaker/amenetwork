import { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, sub, children }: Props) {
  return (
    <section className="pt-12 md:pt-20 pb-12 md:pb-16">
      <div className="container-page">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="display-xl mt-5 max-w-4xl">{title}</h1>
        {sub && <p className="mt-5 text-lg text-ink-2 max-w-2xl">{sub}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
