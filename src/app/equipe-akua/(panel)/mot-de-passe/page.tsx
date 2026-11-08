import type { Metadata } from "next";
import { PasswordForm } from "@/components/admin/password-form";
import { PageHeader, Panel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Mon mot de passe" };

export default function PasswordPage() {
  return (
    <div className="flex max-w-[640px] flex-col gap-5 md:gap-6">
      <PageHeader title="Mon mot de passe" description="Remplacez le mot de passe provisoire reçu sur WhatsApp par un mot de passe personnel, connu de vous seul." />
      <Panel>
        <PasswordForm />
      </Panel>
    </div>
  );
}
