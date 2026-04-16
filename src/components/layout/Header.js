'use client';

/**
 * Page header component with title, subtitle, and optional action button.
 * Stacks vertically on mobile, row on desktop.
 */
export default function Header({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] m-0">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] mt-1 m-0">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
