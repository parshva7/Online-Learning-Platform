import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const { data, error } = await supabase.from("courses").select("*");

    if (error) {
      console.error(error);
      return;
    }

    setCourses(data);
    setLoading(false);
  }

  if (loading)
    return (
      <p
        style={{
          padding: "30px",
          textAlign: "center",
          fontSize: "18px",
          color: "#475569",
        }}
      >
        Loading...
      </p>
    );

  if (courses.length === 0) {
    return (
      <p
        style={{
          padding: "30px",
          textAlign: "center",
          fontSize: "18px",
          color: "#475569",
        }}
      >
        No courses yet.
      </p>
    );
  }

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
      <h2
        style={{
          fontSize: "34px",
          fontWeight: "700",
          color: "#0f172a",
          marginBottom: "25px",
        }}
      >
        Available Courses
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "25px",
        }}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            style={{
              padding: "20px",
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              {course.title}
            </h3>

            <p
              style={{
                color: "#475569",
                fontSize: "15px",
                marginBottom: "15px",
              }}
            >
              {course.description}
            </p>

            <a
              href={`/courses/${course.id}`}
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "#3b82f6",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "15px",
                textAlign: "center",
              }}
            >
              View Course
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
