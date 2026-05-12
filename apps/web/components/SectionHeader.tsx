type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
};

export function SectionHeader({ eyebrow, title, description, align = 'left' }: Props) {
  return (
    <div className={align === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}>
      {eyebrow && (
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
          <span className="inline-block w-1 h-1 bg-accent mr-2 align-middle" />
          {eyebrow}
        </p>
      )}
      <h2 className="font-mono font-medium text-3xl sm:text-4xl text-jet tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-jet/65 text-base leading-relaxed">{description}</p>
      )}
    </div>
  );
}
