import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("role", "instructor");
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("instructor_id", user.id);

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setCourses(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("role");
    window.location.href = "/instructor/login";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        padding: "50px 10vw",
        background: "linear-gradient(to bottom right, #eef3ff, #f8fbff)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: "#0f172a",
          marginBottom: "10px",
        }}
      >
        Instructor Dashboard
      </h1>

      <p style={{ fontSize: "17px", color: "#334155" }}>
        Welcome. You are logged in as an instructor.
      </p>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: "15px",
          padding: "10px 18px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        Logout
      </button>

      {/* Actions */}
      <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
        <a
          href="/courses/create"
          style={{
            padding: "10px 18px",
            background: "#3b82f6",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          Create New Course
        </a>

        <a
          href="/courses"
          style={{
            padding: "10px 18px",
            background: "#475569",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          View All Courses
        </a>
      </div>

      {/* Analytics Card */}
      <div
        style={{
          marginTop: "50px",
          padding: "25px",
          background: "white",
          border: "1px solid #dce3ee",
          borderRadius: "16px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
          maxWidth: "500px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: "#0f172a",
          }}
        >
          Your Course Summary
        </h2>

        {loading ? (
          <p style={{ marginTop: "12px", color: "#334155" }}>Loading...</p>
        ) : courses.length === 0 ? (
          <p style={{ marginTop: "12px", color: "#334155" }}>
            You haven’t created any courses yet.
          </p>
        ) : (
          <p
            style={{
              marginTop: "15px",
              fontSize: "20px",
              color: "#1e293b",
              fontWeight: "500",
            }}
          >
            You have{" "}
            <strong style={{ color: "#3b82f6", fontSize: "22px" }}>
              {courses.length}
            </strong>{" "}
            course{courses.length > 1 ? "s" : ""} created.
          </p>
        )}
      </div>
    </div>
  );
}
