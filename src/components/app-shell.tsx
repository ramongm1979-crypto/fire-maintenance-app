import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileNav } from "@/components/mobile-nav";
import { BackButton } from "@/components/back-button";

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1">
      <SidebarNav />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b px-6 py-3 print:hidden">
          <BackButton />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="size-4" />
                Salir
              </Button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 pb-20 sm:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
