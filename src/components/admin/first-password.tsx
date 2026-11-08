import { KeyRound } from "lucide-react";
import { PasswordForm } from "./password-form";

/** Première connexion : l'équipier doit remplacer son mot de passe provisoire avant d'accéder à son espace. */
export function FirstPassword({ name }: { name: string }) {
  return (
    <div className="mx-auto w-full max-w-[560px] py-4 md:py-10">
      <div className="rounded-[28px] border border-akua-gray-200 bg-akua-white p-6 shadow-[0_30px_70px_-40px_rgb(11_16_32/0.35)] md:p-9">
        <span className="grid size-14 place-items-center rounded-[18px] bg-akua-blue-100">
          <KeyRound aria-hidden className="size-6 text-akua-blue" strokeWidth={1.7} />
        </span>
        <h1 className="mt-5 text-[26px] leading-tight font-extrabold tracking-[-0.03em]">Bienvenue {name.split(" ")[0]}.</h1>
        <p className="mt-1.5 text-[14.5px] text-akua-gray-500">Pour sécuriser votre accès, choisissez votre propre mot de passe. Le mot de passe provisoire ne fonctionnera plus ensuite.</p>
        <div className="mt-7">
          <PasswordForm first />
        </div>
      </div>
    </div>
  );
}
