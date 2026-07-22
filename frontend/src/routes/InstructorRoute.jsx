// src/routes/InstructorRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function InstructorRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkRole() {
      // ✅ 1. Check session
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setLoading(false);
        return; // ⛔ Not logged in → reject
      }

      // ✅ 2. Fetch profile role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "instructor") {
        setAllowed(true); // ✅ Allow only instructor
      }

      setLoading(false);
    }

    checkRole();
  }, []);

  if (loading) return <p>Loading...</p>;

  // ⛔ Not instructor → go to instructor login
  if (!allowed) return <Navigate to="/instructor/login" replace />;

  return children;
}
