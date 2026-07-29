export function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(16,20,12,0.04),0_8px_24px_-12px_rgba(16,20,12,0.12)] dark:bg-stone-900/40 dark:border-stone-800 ${className}`}
    >
      {children}
    </div>
  );
}
