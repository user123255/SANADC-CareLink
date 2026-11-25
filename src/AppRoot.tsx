
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./lib/firebase";
import AuthScreen from "./components/AuthScreen";
import HealthWorkerDashboard from "./components/HealthWorkerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import App from "./App";

import type { UserProfile } from "./types";

export default function AppRoot() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const [retryCount, setRetryCount] = useState(0);

  const authRequest = useRef(0);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const requestId = ++authRequest.current;
      let loadingStage = "user profile";

      setLoading(true);
      setError("");
      setApplicationStatus(null);
      setUser(currentUser);
      setProfile(null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        let profileSnapshot = null;

        // Allow time for the registration process to finish creating
        // the Firestore profile after Firebase Authentication succeeds.
        for (let attempt = 0; attempt < 30; attempt++) {
          loadingStage = "user profile";

          profileSnapshot = await getDoc(
            doc(db, "users", currentUser.uid)
          );

          if (!mounted || authRequest.current !== requestId) return;

          if (profileSnapshot.exists()) break;

          if (attempt < 29) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        if (!mounted || authRequest.current !== requestId) return;

        if (!profileSnapshot?.exists()) {
          loadingStage = "staff application";

          const applicationSnapshot = await getDoc(
            doc(db, "staffApplications", currentUser.uid)
          );

          if (!mounted || authRequest.current !== requestId) return;

          if (applicationSnapshot.exists()) {
            const application = applicationSnapshot.data();

            if (
              application.uid !== currentUser.uid ||
              application.requestedRole !== "healthWorker"
            ) {
              setError(
                "Your staff application contains invalid account information. Please contact the administrator."
              );
              return;
            }

            setApplicationStatus(
              typeof application.status === "string"
                ? application.status
                : "submitted"
            );
          } else {
            setError(
              "Your account exists, but your SANAD profile was not found. Please contact the administrator."
            );
          }

          return;
        }

        const data = profileSnapshot.data() as UserProfile;

        if (data.uid !== currentUser.uid) {
          setError(
            "Your profile does not match your authenticated account. Please contact the administrator."
          );
          return;
        }

        const authenticatedEmail = currentUser.email?.trim().toLowerCase();
        const profileEmail = data.email?.trim().toLowerCase();

        if (
          !authenticatedEmail ||
          !profileEmail ||
          authenticatedEmail !== profileEmail
        ) {
          setError(
            "Your account email does not match your SANAD profile. Please contact the administrator."
          );
          return;
        }

        if (
          data.role !== "patient" &&
          data.role !== "healthWorker" &&
          data.role !== "admin"
        ) {
          setError("Your account has an invalid access role.");
          return;
        }

        if (data.accountStatus !== "active") {
          setError(
            "Your account is not active. Please contact the administrator."
          );
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error(`SANAD ${loadingStage} loading error:`, err);

        if (mounted && authRequest.current === requestId) {
          const firebaseError = err as {
            code?: string;
            message?: string;
          };

          if (firebaseError.code === "permission-denied") {
            setError(
              `Firestore denied access while reading your ${loadingStage}. Error: permission-denied.`
            );
          } else if (
            firebaseError.code === "unavailable" ||
            firebaseError.code === "network-request-failed"
          ) {
            setError(
              "Unable to connect to Firebase. Check your internet connection and retry."
            );
          } else {
            setError(
              `Unable to load your ${loadingStage}. Error: ${
                firebaseError.code || "unknown"
              }. ${firebaseError.message || ""}`
            );
          }
        }
      } finally {
        if (mounted && authRequest.current === requestId) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      authRequest.current += 1;
      unsubscribe();
    };
  }, [retryCount]);

  async function handleSignOut() {
    try {
      await signOut(auth);
      setProfile(null);
      setApplicationStatus(null);
      setError("");
    } catch (err) {
      console.error("Sign-out error:", err);
      setError("Unable to sign out. Please try again.");
    }
  }

  function handleRetry() {
    setError("");
    setProfile(null);
    setApplicationStatus(null);
    setLoading(true);
    setRetryCount((count) => count + 1);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="text-sm font-semibold text-blue-900">
            Loading SANAD CareLink...
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Preparing your secure dashboard
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (applicationStatus) {
    const isPending = applicationStatus === "pending";
    const isRejected = applicationStatus === "rejected";

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            {isPending ? "🕒" : isRejected ? "✕" : "ℹ️"}
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            {isPending
              ? "Staff application submitted"
              : isRejected
                ? "Staff application not approved"
                : "Staff application status"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isPending
              ? "Your staff application is awaiting administrator review. Dashboard access will be available after approval and activation."
              : isRejected
                ? "Your healthcare worker application was not approved. Please contact your facility administrator for more information."
                : "Your application has been reviewed. If you believe this status is incorrect, please contact the administrator."}
          </p>

          <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
            Application status: {applicationStatus}
          </p>

          <button
            onClick={handleSignOut}
            className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
            🔒
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load your dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {error || "Your profile could not be loaded."}
          </p>

          <button
            onClick={handleRetry}
            className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Retry loading profile
          </button>

          <button
            onClick={handleSignOut}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (profile.role === "patient") {
    return (
      <App
        authenticatedProfile={profile}
        onSignOut={handleSignOut}
      />
    );
  }

  if (profile.role === "healthWorker") {
    return (
      <HealthWorkerDashboard
        profile={profile}
        onSignOut={handleSignOut}
      />
    );
  }

  if (profile.role === "admin") {
    return (
      <AdminDashboard
        profile={profile}
        onSignOut={handleSignOut}
      />
    );
  }

  return null;
}


