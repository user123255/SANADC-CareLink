
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { createPatientProfile } from "../services/users";
import {
  HeartHandshake,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Heart,
  LockKeyhole,
} from "lucide-react";
import { auth } from "../lib/firebase";

export default function AuthScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [facility, setFacility] = useState("Kiryandongo Health Centre");
  const [language, setLanguage] = useState("English");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegistering) {
        if (!fullName.trim()) {
          throw new Error("Please enter your full name.");
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await createPatientProfile(credential.user.uid, {
          fullName,
          email: credential.user.email ?? email,
          preferredLanguage: language,
          facility,
        });
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(
        message.includes("auth/email-already-in-use")
          ? "This email already has an account. Please sign in."
          : message.includes("auth/invalid-credential")
          ? "Incorrect email or password."
          : message.includes("auth/weak-password")
          ? "Your password must contain at least 6 characters."
          : message.includes("auth/invalid-email")
          ? "Please enter a valid email address."
          : message.includes("auth/network-request-failed")
          ? "Network error. Please check your internet connection."
          : message.includes("permission-denied")
          ? "Your account was created, but your profile could not be saved. Please contact the administrator."
          : message
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess("Password reset instructions have been sent to your email.");
    } catch {
      setError(
        "Unable to send a password reset email. Please check the address."
      );
    }
  }

  function switchMode() {
    setIsRegistering(!isRegistering);
    setError("");
    setSuccess("");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "var(--app-bg)" }}
    >
      <div className="w-full max-w-6xl grid lg:grid-cols-2 overflow-hidden rounded-[28px] border shadow-xl"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* LEFT BRANDING PANEL */}
        <section
          className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #63365F 0%, #784C75 55%, #956B91 100%)",
          }}
        >
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-white/10" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <HeartHandshake size={27} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  SANAD CareLink
                </h1>
                <p className="text-sm text-white/75">
                  Maternal Health Support
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium">
                <Heart size={14} />
                Care, connection and support
              </span>

              <h2 className="mt-7 text-4xl font-bold leading-tight">
                Your journey to motherhood deserves support.
              </h2>

              <p className="mt-5 text-base leading-8 text-white/80">
                Stay connected with your maternal healthcare journey.
                Keep track of appointments, follow-ups and important
                health information in one place.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-16 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheck size={21} />
              </div>
              <div>
                <p className="font-semibold">Your care matters</p>
                <p className="text-sm text-white/70">
                  Designed to support your healthcare journey.
                </p>
              </div>
            </div>

            <p className="text-xs text-white/60">
              SANAD CareLink · Maternal healthcare support
            </p>
          </div>
        </section>

        {/* RIGHT AUTHENTICATION PANEL */}
        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
          <div className="mx-auto w-full max-w-md">
            {/* MOBILE BRANDING */}
            <div className="mb-9 lg:hidden">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <HeartHandshake size={26} />
                </div>

                <div>
                  <h1
                    className="text-xl font-bold"
                    style={{ color: "var(--primary)" }}
                  >
                    SANAD CareLink
                  </h1>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Maternal Health Support
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <p
                className="mb-3 text-sm font-semibold uppercase tracking-widest"
                style={{ color: "var(--secondary)" }}
              >
                {isRegistering ? "Join SANAD" : "Welcome to SANAD"}
              </p>

              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: "var(--text-main)" }}
              >
                {isRegistering ? "Create your account" : "Welcome back"}
              </h2>

              <p
                className="mt-3 text-sm leading-6"
                style={{ color: "var(--text-muted)" }}
              >
                {isRegistering
                  ? "Create your account to access your maternal health support."
                  : "Sign in to continue to your personal healthcare support space."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegistering && (
                <>
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold"
                      style={{ color: "var(--text-main)" }}
                    >
                      Full name
                    </label>

                    <input
                      id="fullName"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3.5 outline-none focus:ring-2"
                      style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--text-main)",
                        borderColor: "var(--border)",
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="facility"
                      className="mb-2 block text-sm font-semibold"
                      style={{ color: "var(--text-main)" }}
                    >
                      Health facility
                    </label>

                    <input
                      id="facility"
                      required
                      value={facility}
                      onChange={(e) => setFacility(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3.5 outline-none focus:ring-2"
                      style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--text-main)",
                        borderColor: "var(--border)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="language"
                      className="mb-2 block text-sm font-semibold"
                      style={{ color: "var(--text-main)" }}
                    >
                      Preferred language
                    </label>

                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3.5 outline-none"
                      style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--text-main)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <option>English</option>
                      <option>Other (to be confirmed)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  Email address
                </label>

                <input
                  id="email"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3.5 outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text-main)",
                    borderColor: "var(--border)",
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isRegistering ? "new-password" : "current-password"
                    }
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3.5 pr-12 outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--text-main)",
                      borderColor: "var(--border)",
                    }}
                    placeholder="At least 6 characters"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {!isRegistering && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border p-3 text-sm"
                  style={{
                    backgroundColor: "#FFF1F2",
                    color: "#9F3347",
                    borderColor: "#F5C8D0",
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-xl border p-3 text-sm"
                  style={{
                    backgroundColor: "#EDF7F0",
                    color: "#326747",
                    borderColor: "#C8E5D0",
                  }}
                >
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: "var(--primary)",
                  boxShadow: "0 8px 20px rgba(99, 54, 95, 0.18)",
                }}
              >
                {loading
                  ? "Please wait..."
                  : isRegistering
                  ? "Create account"
                  : "Sign in"}

                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            <div
              className="my-7 border-t"
              style={{ borderColor: "var(--border)" }}
            />

            <p
              className="text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              {isRegistering
                ? "Already have an account?"
                : "New to SANAD CareLink?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="font-bold hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {isRegistering ? "Sign in" : "Create an account"}
              </button>
            </p>

            <div
              className="mt-9 flex items-center justify-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <LockKeyhole size={14} />
              <span>Maternal healthcare support</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

