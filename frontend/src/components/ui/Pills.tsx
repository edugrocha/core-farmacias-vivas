export interface PillOption {
  value: string;
  label: string;
}

interface PillsProps {
  options: PillOption[];
  ativo: string;
  onChange: (valor: string) => void;
}

export function Pills({ options, ativo, onChange }: PillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selecionado = opt.value === ativo;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              selecionado
                ? "bg-ink text-primary-ink"
                : "bg-stone-100 text-stone-600 hover:bg-primary-50 dark:bg-stone-800 dark:text-stone-300"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
