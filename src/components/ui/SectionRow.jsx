/**
 * SectionRow.jsx
 * A horizontal scrollable section with title and "See All" link.
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SectionRow({ title, seeAllLink, children, className = '' }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between px-6 mb-4">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            className="p-1 rounded-full hover:bg-white/10 text-muted hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-1 rounded-full hover:bg-white/10 text-muted hover:text-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {seeAllLink && (
            <Link
              to={seeAllLink}
              className="text-xs font-semibold text-muted hover:text-primary uppercase tracking-wider transition-colors ml-1"
            >
              See all
            </Link>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="scroll-row px-6">
        {children}
      </div>
    </section>
  );
}
