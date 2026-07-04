'use client';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeading({
  badge,
  title,
  subtitle,
  centered = true,
  light = false,
}: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      {badge && (
        <span
          className={`inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full mb-4 ${
            light
              ? 'bg-white/10 text-white/80 border border-white/10'
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}
        >
          {badge}
        </span>
      )}
      <h2
        className={`font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 ${
          light ? 'text-white' : 'text-text'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
            centered ? 'mx-auto' : ''
          } ${light ? 'text-gray-300' : 'text-text/60'}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
