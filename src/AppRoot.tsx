
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import AuthScreen from "./components/AuthScreen";
import App from "./App";
import type { UserProfile } from "./types";

export default function AppRoot() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError("");
      setUser(currentUser);
      setProfile(null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (!profileSnapshot.exists()) {
          setError(
            "Your account exists, but your SANAD profile was not found. Please contact the administrator."
          );
          return;
        }

        const data = profileSnapshot.data() as UserProfile;

        if (data.role !== "patient") {
          setError(
            "This account does not have patient dashboard access. Please contact the administrator."
          );
          return;
        }

        if (data.accountStatus !== "active") {
          setError(
            "Your account is currently suspended. Please contact the administrator."
          );
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error("Profile loading error:", err);
        setError(
          "We could not load your profile. Please check your internet connection and try again."
        );
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function handleSignOut() {
    try {
      await signOut(auth);
      setProfile(null);
      setError("");
    } catch (err) {
      console.error("Sign-out error:", err);
      setError("Unable to sign out. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-green-800">
          Loading SANAD CareLink...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to access your profile
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {error || "Your profile could not be loaded."}
          </p>
          <button
            onClick={handleSignOut}
            className="mt-6 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <App authenticatedProfile={profile} />;
}
