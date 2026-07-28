import { PainelSidebar } from "@/components/layout/PainelSidebar";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 gap-6">
      <PainelSidebar />
      <div className="flex-1 py-6">{children}</div>
    </div>
  );
}
