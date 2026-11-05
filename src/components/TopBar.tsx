import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/site";

export function TopBar({ links, email }: { links: { href: string; label: string }[]; email: string | null }) {
  return (
    <header className="topbar">
      <strong>{PRODUCT_NAME}</strong>
      <nav>
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
      <span className="muted">{email}</span>
      <form action="/auth/signout" method="post">
        <button className="button ghost" type="submit">
          Déconnexion
        </button>
      </form>
    </header>
  );
}
