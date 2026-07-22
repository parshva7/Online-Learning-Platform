import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function StudentRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      // Not logged in → send to student login
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // Logged in + correct role
      if (profile?.role === "student") {
        setAllowed(true);
      }

      setLoading(false);
    }

    checkRole();
  }, []);

  if (loading) return <p>Loading...</p>;

  // Wrong role OR not logged in → send to student login
  if (!allowed) return <Navigate to="/student/login" replace />;

  return children;
}
