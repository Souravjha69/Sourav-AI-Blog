import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthors } from "@/lib/staticData";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import SplitHeading from "@/components/SplitHeading";

export default function AuthorsList() {
  const [authors, setAuthors] = useState([]);
  useEffect(() => { setAuthors(getAuthors()); }, []);

  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 max-w-[1400px] mx-auto px-6 md:px-12">
        <Reveal><div className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] mb-5">Writers</div></Reveal>
        <SplitHeading text="The voice behind sourav.log." as="h1" className="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6 max-w-3xl" />
        <Reveal delay={0.3}><p className="text-lg text-[var(--text-sec)] max-w-xl">The people building at the edge, and thinking out loud about it.</p></Reveal>
      </section>
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {authors.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.08}>
              <Link to={`/author/${a.id}`} className="group grid grid-cols-5 gap-6 rounded-3xl border border-[var(--border)] p-6 hover:border-[var(--text)] transition-colors card-lift" data-testid={`author-${a.id}`}>
                <img src={a.avatar_url} alt="" className="col-span-2 aspect-square object-cover rounded-2xl group-hover:scale-[1.02] transition-transform" />
                <div className="col-span-3 flex flex-col justify-center">
                  <div className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--accent)] mb-2">{a.role}</div>
                  <h3 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-3">{a.name}</h3>
                  <p className="text-sm text-[var(--text-sec)] leading-relaxed">{a.bio}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
