
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  HeartHandshake,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Heart,
  LockKeyhole,
  Stethoscope,
} from "lucide-react";

import { auth } from "../lib/firebase";
import { createPatientProfile } from "../services/users";
import { createStaffApplication } from "../services/staffApplications";

type AccountRole = "patient" | "healthWorker" | "admin";

export default function AuthScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AccountRole>("patient");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [facility, setFacility] = useState("Kiryandongo Health Centre");
  const [language, setLanguage] = useState("English");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    let accountCreated = false;

    try {
      if (isRegistering) {
        if (!fullName.trim()) {
          throw new Error("Please enter your full name.");
        }

        if (!facility.trim()) {
          throw new Error("Please enter your health facility.");
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

        accountCreated = true;

        if (role === "patient") {
          await createPatientProfile(credential.user.uid, {
            fullName,
            email: credential.user.email ?? email,
            preferredLanguage: language,
            facility,
            phone,
          });

          setSuccess(
            "Your patient account has been created. Welcome to SANAD CareLink!"
          );
        } else {
          await createStaffApplication({
            uid: credential.user.uid,
            fullName,
            email: credential.user.email ?? email,
            requestedRole: role,
            facility,
          });

          setSuccess(
            role === "healthWorker"
              ? "Your healthcare worker application has been submitted. Your account will receive access after administrator approval."
              : "Your administrator application has been submitted. Access will be granted only after authorized verification."
          );
        }

        setIsRegistering(false);
        setPassword("");
        setFullName("");
        setPhone("");
        return;
      }

      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
        } catch (err: unknown) {
      console.error("Authentication error:", err);

      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      if (accountCreated) {
        setError(
          "Your login account was created, but its SANAD profile or application could not be saved. Please contact the administrator before trying to register again."
        );
      } else {
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
                      ? "You do not have permission to complete this action."
                      : message
        );
      }
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
      setError("Unable to send a password reset email. Please check the address.");
    }
  }

  function switchMode() {
    setIsRegistering(!isRegistering);
    setError("");
    setSuccess("");
    setRole("patient");
  }

  const inputStyle = {
    backgroundColor: "var(--surface)",
    color: "var(--text-main)",
    borderColor: "var(--border)",
  };

  const roles: {
    value: AccountRole;
    title: string;
    description: string;
    icon: typeof Heart;
  }[] = [
    {
      value: "patient",
      title: "Patient",
      description: "Appointments, maternal care and health support",
      icon: Heart,
    },
    {
      value: "healthWorker",
      title: "Healthcare worker",
      description: "Patient care, follow-ups and communication",
      icon: Stethoscope,
    },
    {
      value: "admin",
      title: "Administrator",
      description: "Facility oversight and staff management",
      icon: ShieldCheck,
    },
  ];

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "var(--app-bg)" }}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-[28px] border shadow-xl"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >

        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-9">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <HeartHandshake size={26} />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "var(--primary)" }}>
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

              <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                {isRegistering
                  ? "Choose your account type to get started."
                  : "Sign in to continue to your SANAD CareLink dashboard."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegistering && (
                <>
                  <div>
                    <label className="mb-3 block text-sm font-semibold" style={{ color: "var(--text-main)" }}>
                      I am registering as
                    </label>

                    <div className="space-y-2">
                      {roles.map((item) => {
                        const Icon = item.icon;
                        const selected = role === item.value;

                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setRole(item.value)}
                            className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:border-blue-400"
                            style={{
                              borderColor: selected ? "var(--primary)" : "var(--border)",
                              backgroundColor: selected ? "rgba(37,99,235,0.07)" : "var(--surface)",
                            }}
                          >
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                              style={{
                                color: "var(--primary)",
                                backgroundColor: "rgba(37,99,235,0.10)",
                              }}
                            >
                              <Icon size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold" style={{ color: "var(--text-main)" }}>
                                {item.title}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {item.description}
                              </p>
                            </div>
                            <span
                              className="flex h-5 w-5 items-center justify-center rounded-full border"
                              style={{
                                borderColor: selected ? "var(--primary)" : "var(--border)",
                                backgroundColor: selected ? "var(--primary)" : "transparent",
                              }}
                            >
                              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {role !== "patient" && (
                      <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                        Staff accounts require administrator verification.
                        Selecting this option does not grant access to patient records.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="fullName" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-main)" }}>
                      Full name
                    </label>
                    <input
                      id="fullName"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3.5 outline-none focus:ring-2"
                      style={inputStyle}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {role === "patient" && (
                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-main)" }}>
                        Phone number (optional)
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border px-4 py-3.5 outline-none"
                        style={inputStyle}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="facility" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-main)" }}>
                      Health facility
                    </label>
                    <input
                      id="facility"
                      required
                      value={facility}
                      onChange={(e) => setFacility(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3.5 outline-none"
                      style={inputStyle}
                    />
                  </div>

                  {role === "patient" && (
                    <div>
                      <label htmlFor="language" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-main)" }}>
                        Preferred language
                      </label>
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full rounded-xl border px-4 py-3.5 outline-none"
                        style={inputStyle}
                      >
                        <option>English</option>
                        <option>Other (to be confirmed)</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-main)" }}>
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
                  style={inputStyle}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-main)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete={isRegistering ? "new-password" : "current-password"}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3.5 pr-12 outline-none focus:ring-2"
                    style={inputStyle}
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
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loading
                  ? "Please wait..."
                  : isRegistering
                    ? role === "patient"
                      ? "Create patient account"
                      : "Submit application"
                    : "Sign in"}
                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            <div className="my-7 border-t" style={{ borderColor: "var(--border)" }} />

            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              {isRegistering ? "Already have an account?" : "New to SANAD CareLink?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="font-bold hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {isRegistering ? "Sign in" : "Create an account"}
              </button>
            </p>

            <div className="mt-9 flex items-center justify-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <LockKeyhole size={14} />
              <span>Secure maternal healthcare support</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

