import Link from "next/link";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/instalaciones", label: "Instalaciones" },
  { href: "/manuales", label: "Manuales" },
  { href: "/calendario", label: "Calendario" },
];

export function NavBar({ userEmail }: { userEmail: string }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4">
          <span className="font-semibold">🔥 Mantenimiento Incendios</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Salir
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
