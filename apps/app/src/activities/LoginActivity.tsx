import { Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { useEffect, useRef, useState } from "react";
import { AppBar, AppBarCloseButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { useAuth } from "../auth/AuthContext";

declare module "@stackflow/config" {
  interface Register {
    LoginActivity: {};
  }
}

const RESEND_COOLDOWN = 60; // soniya — backenddagi OTP_COOLDOWN bilan mos

/** Telefon → SMS OTP kirish oqimi (Daangn'dagi kabi: raqam → kod → profil/mahalla). */
const LoginActivity: ActivityComponentType<"LoginActivity"> = () => {
  const { pop, replace } = useFlow();
  const { requestOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [rawPhone, setRawPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const phoneDigits = rawPhone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length === 9; // 9XX XXX XXX, +998 kodsiz kiritiladi

  const sendCode = async () => {
    if (!phoneValid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await requestOtp(phoneDigits);
      setStep("code");
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => codeInputRef.current?.focus(), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod yuborilmadi");
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    if (code.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const user = await verifyOtp(phoneDigits, code);
      if (!user.regionId) {
        replace("RegionSelectActivity", {});
      } else {
        pop();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod noto'g'ri yoki muddati o'tgan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarCloseButton />
        </AppBarLeft>
        <AppBarMain title="Kirish" />
      </AppBar>
      <AppScreenContent>
        <VStack gap="x6" px="spacingX.globalGutter" py="x6">
          {step === "phone" ? (
            <>
              <VStack gap="x1">
                <Text as="h1" textStyle="t7Bold">
                  Telefon raqamingiz
                </Text>
                <Text textStyle="t4Regular" color="fg.neutralSubtle">
                  Mahalladoshlaringiz bilan ishonchli muloqot qilish uchun telefon raqamingizni
                  tasdiqlang. Raqam boshqa foydalanuvchilarga ko'rsatilmaydi.
                </Text>
              </VStack>
              <TextField label="Telefon raqam" prefix="+998" invalid={!!error} errorMessage={error ?? undefined}>
                <TextFieldInput
                  inputMode="numeric"
                  placeholder="90 123 45 67"
                  value={rawPhone}
                  maxLength={9}
                  onChange={(e) => setRawPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  autoFocus
                />
              </TextField>
              <ActionButton
                size="large"
                variant="brandSolid"
                disabled={!phoneValid}
                loading={busy}
                onClick={sendCode}
              >
                Kodni yuborish
              </ActionButton>
            </>
          ) : (
            <>
              <VStack gap="x1">
                <Text as="h1" textStyle="t7Bold">
                  SMS kodni kiriting
                </Text>
                <Text textStyle="t4Regular" color="fg.neutralSubtle">
                  +998 {phoneDigits} raqamiga 6 xonali kod yuborildi.
                </Text>
              </VStack>
              <TextField label="Tasdiqlash kodi" invalid={!!error} errorMessage={error ?? undefined}>
                <TextFieldInput
                  ref={codeInputRef}
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoFocus
                />
              </TextField>
              <ActionButton
                size="large"
                variant="brandSolid"
                disabled={code.length !== 6}
                loading={busy}
                onClick={confirmCode}
              >
                Tasdiqlash
              </ActionButton>
              <ActionButton
                size="medium"
                variant="neutralOutline"
                disabled={cooldown > 0 || busy}
                onClick={sendCode}
              >
                {cooldown > 0 ? `Qayta yuborish (${cooldown}s)` : "Kodni qayta yuborish"}
              </ActionButton>
            </>
          )}
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
};

export default LoginActivity;
