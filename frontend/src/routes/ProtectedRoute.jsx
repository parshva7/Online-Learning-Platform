// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ allowedRole, loginPath, children }) {
  const [userRole, setUserRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();

      // ✅ not logged in → send to correct login page
      if (!session) {
        setChecking(false);
        return;
      }

      const userId = session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      setUserRole(profile?.role || null);
      setChecking(false);
    }

    check();
  }, []);

  if (checking) return <p>Loading...</p>;

  // ✅ redirect to respective login page
  if (userRole !== allowedRole) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
}
