import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const student = JSON.parse(localStorage.getItem("student"));
  const studentId = student?.id;

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    loadDashboard();
  }, [studentId]);

  const loadDashboard = async () => {
    setLoading(true);
    await Promise.all([loadCourses(), loadProgress(), loadDailyCount()]);
    setLoading(false);
  };

  const loadCourses = async () => {
    const { data } = await supabase.from("courses").select("*");
    setCourses(data || []);
  };

  const loadProgress = async () => {
    const { data: progressData } = await supabase
      .from("student_course_progress")
      .select("course_id, watched_videos, total_videos")
      .eq("student_id", studentId);

    const progressMap = {};
    progressData?.forEach((p) => {
      const percent =
        p.total_videos > 0
          ? Math.round((p.watched_videos / p.total_videos) * 100)
          : 0;
      progressMap[p.course_id] = percent;
    });

    setProgress(progressMap);
  };

  const loadDailyCount = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("daily_video_track")
      .select("count")
      .eq("student_id", studentId)
      .eq("date", today)
      .maybeSingle();

    setDailyCount(data?.count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("student");
    window.location.href = "/student/login";
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #eef3ff, #f8fbff)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p>Loading dashboard...</p>
      </div>
    );

  // 🎯 FULL SCREEN DASHBOARD (no split)
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
<h1 style={{ fontSize: "36px", fontWeight: "700", color: "#0f172a" }}>
  Student Dashboard
</h1>

      <p style={{ fontSize: "17px", color: "#334155" }}>
  Welcome back. Continue your learning journey.
</p>

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

      {/* COURSES */}
      <div style={{ marginTop: "40px" }}>
<h2 style={{ fontSize: "26px", marginBottom: "20px", color: "#1e293b" }}>
  Your Courses
</h2>

        {courses.length === 0 ? (
          <p>No courses available yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "20px",
              maxWidth: "650px",
            }}
          >
            {courses.map((c) => {
              const percent = progress[c.id] || 0;

              return (
                <div
                  key={c.id}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "white",
                    border: "1px solid #dce3ee",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                 <h3 style={{ fontSize: "22px", marginBottom: "4px", color: "#1e293b" }}>
  {c.title}
</h3>


     <p style={{ color: "#475569", margin: "5px 0 10px" }}>
  {c.description}
</p>

                  <div
                    style={{
                      background: "#e2e8f0",
                      height: "10px",
                      borderRadius: "5px",
                      overflow: "hidden",
                      margin: "12px 0",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${percent}%`,
                        background: percent === 100 ? "#22c55e" : "#3b82f6",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>

                  <p style={{ color: "#1e293b" }}>
  Progress: <strong>{percent}%</strong>
</p>

                  <a
                    href={`/courses/${c.id}`}
                    style={{
                      display: "inline-block",
                      padding: "10px 18px",
                      background: "#3b82f6",
                      color: "white",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "15px",
                    }}
                  >
                    Continue Course
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
