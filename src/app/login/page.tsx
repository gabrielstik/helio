import { supabaseConfigured } from "@/lib/supabase/env";
import { sendMagicLink } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";

  return (
    <main>
      <h1>Connexion</h1>
      {!supabaseConfigured && (
        <div className="notice">
          Supabase n&apos;est pas configuré : renseignez <code>.env.local</code> (voir <code>.env.example</code> et le README).
        </div>
      )}
      {sp.sent && <div className="notice">Un lien de connexion vient de partir. Ouvrez-le depuis votre boîte mail.</div>}
      {typeof sp.error === "string" && <div className="notice">Erreur : {sp.error}</div>}
      <form className="stack" action={sendMagicLink}>
        <input type="hidden" name="next" value={next} />
        <label>
          E-mail
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <button className="button" type="submit" disabled={!supabaseConfigured}>
          Recevoir un lien de connexion
        </button>
      </form>
    </main>
  );
}
