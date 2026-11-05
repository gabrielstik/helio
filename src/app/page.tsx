import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/site";

export default function Home() {
  return (
    <main>
      <h1>{PRODUCT_NAME}</h1>
      <p className="muted">Le CRM et les galeries clients du photographe, dans une seule app.</p>
      <p>
        <Link className="button" href="/login">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
