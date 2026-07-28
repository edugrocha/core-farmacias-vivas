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
      className={`rounded-xl border border-stone-200 bg-white shadow-sm dark:bg-stone-900/40 dark:border-stone-800 ${className}`}
    >
      {children}
    </div>
  );
}
