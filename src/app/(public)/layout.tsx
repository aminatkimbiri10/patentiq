import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background">
      <PublicHeader />
      <main className="flex-1 bg-mesh">{children}</main>
      <PublicFooter />
    </div>
  );
}
