"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MfaFactor = {
  id: string;
  factor_type: string;
  friendly_name?: string;
  status: string;
};

export function MfaSettingsPanel() {
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [qr, setQr] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data, error: listErr } = await supabase.auth.mfa.listFactors();
    if (listErr) {
      setError(listErr.message);
      return;
    }
    setFactors([...(data.totp ?? []), ...(data.phone ?? [])] as MfaFactor[]);
  }, [supabase.auth.mfa]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function startEnroll() {
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "I2PA Authenticator",
    });
    setLoading(false);
    if (enrollErr) {
      setError(enrollErr.message);
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setMessage("Scannez le QR code avec Google Authenticator ou Authy, puis entrez le code.");
  }

  async function confirmEnroll() {
    if (!factorId || !verifyCode.trim()) return;
    setLoading(true);
    setError(null);
    const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr) {
      setLoading(false);
      setError(chErr.message);
      return;
    }
    const { error: verErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode.trim(),
    });
    setLoading(false);
    if (verErr) {
      setError(verErr.message);
      return;
    }
    setQr(null);
    setVerifyCode("");
    setFactorId(null);
    setMessage("2FA activée avec succès.");
    void refresh();
  }

  async function unenroll(id: string) {
    setLoading(true);
    const { error: uErr } = await supabase.auth.mfa.unenroll({ factorId: id });
    setLoading(false);
    if (uErr) setError(uErr.message);
    else {
      setMessage("Facteur 2FA retiré.");
      void refresh();
    }
  }

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Authentification à deux facteurs (TOTP) — recommandée pour CPI et dossiers confidentiels,
        sur le modèle directompic (code à chaque connexion).
      </p>
      {verified.length === 0 && !qr && (
        <Button type="button" onClick={startEnroll} disabled={loading}>
          Activer la 2FA
        </Button>
      )}
      {qr && (
        <div className="space-y-3 rounded-lg border p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code 2FA" className="mx-auto h-40 w-40" />
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Code à 6 chiffres</Label>
            <Input
              id="mfa-code"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
          </div>
          <Button type="button" onClick={confirmEnroll} disabled={loading}>
            Confirmer l&apos;activation
          </Button>
        </div>
      )}
      {verified.length > 0 && (
        <ul className="space-y-2 text-sm">
          {verified.map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded border px-3 py-2">
              <span>{f.friendly_name ?? "Authenticator"} (actif)</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => unenroll(f.id)}>
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      )}
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
