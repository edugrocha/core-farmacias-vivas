export interface DataTableColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  items: T[];
  keyField: (item: T) => string | number;
  vazio?: string;
}

export function DataTable<T>({ columns, items, keyField, vazio = "Nenhum registro encontrado." }: DataTableProps<T>) {
  if (items.length === 0) {
    return <p className="p-6 text-center text-sm text-stone-500">{vazio}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-stone-200 text-stone-500 dark:border-stone-800">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={keyField(item)}
              className="border-b border-stone-100 last:border-0 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800/40"
            >
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
