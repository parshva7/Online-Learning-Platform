import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { getVideoUrl } from "../../storage";

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState([]);
  const [purchased, setPurchased] = useState(false);
const [openModule, setOpenModule] = useState(null);

  const role = localStorage.getItem("role");
  const isInstructor = role === "instructor";
  const isStudent = role === "student";

  useEffect(() => {
    loadAll();

    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    await loadCourse();
    await loadPurchaseStatus();
    await loadModules();
    if (isStudent) await loadWatchedVideos();
    setLoading(false);
  };

  const loadCourse = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    setCourse(data);
  };

  const loadPurchaseStatus = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user || !isStudent) return;

    const { data } = await supabase
      .from("course_purchases")
      .select("*")
      .eq("student_id", userData.user.id)
      .eq("course_id", id)
      .maybeSingle();

    setPurchased(Boolean(data));
  };

  const handleBuyCourse = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      alert("Please login to purchase.");
      return;
    }

    const res = await fetch("https://online-learning-backend-1.onrender.com/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: course.price || 500,
        courseId: id,
        studentId: userData.user.id,
      }),
    });

    const orderData = await res.json();

    if (!orderData.success) {
      alert("Unable to create order.");
      return;
    }

    const options = {
      key: "rzp_test_Re9SL5X9IRrHEY",
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Online Learning App",
      description: course.title,
      order_id: orderData.orderId,

      handler: async function (response) {
        await fetch("https://online-learning-backend-1.onrender.com/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            studentId: userData.user.id,
            courseId: id,
          }),
        });

        alert("Payment successful!");
        setPurchased(true);
      },

      theme: { color: "#3b82f6" },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  const loadModules = async () => {
    const { data: mods } = await supabase
      .from("modules")
      .select("id, title")
      .eq("course_id", id);

    const list = [];

    for (let m of mods || []) {
      const { data: vids } = await supabase
        .from("videos")
        .select("id, storage_path")
        .eq("module_id", m.id);

      const { data: quiz } = await supabase
        .from("quizzes")
        .select("id, title")
        .eq("module_id", m.id)
        .maybeSingle();

      list.push({
        ...m,
        videos:
          vids?.map((v) => ({
            id: v.id,
            url: getVideoUrl(v.storage_path),
          })) || [],
        quiz: quiz || null,
      });
    }

    setModules(list);
  };

  const loadWatchedVideos = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const { data } = await supabase
      .from("student_video_progress")
      .select("video_id")
      .eq("student_id", userData.user.id)
      .eq("watched", true);

    setWatched(data?.map((d) => String(d.video_id)) || []);
  };

  const markWatched = async (videoId) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    await supabase.from("student_video_progress").upsert(
      {
        student_id: userData.user.id,
        video_id: videoId,
        watched: true,
        watched_at: new Date().toISOString(),
      },
      { onConflict: "student_id,video_id" }
    );

    await loadWatchedVideos();
  };

  // DELETE COURSE (Instructor Only)
const handleDeleteCourse = async () => {
  const ok = window.confirm("Delete this course permanently?");
  if (!ok) return;

  try {
    // 1. Get all modules of this course
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", id);

    // 2. For each module → delete quizzes + quiz questions
    for (let m of modules || []) {
      const { data: quiz } = await supabase
        .from("quizzes")
        .select("id")
        .eq("module_id", m.id)
        .maybeSingle();

      if (quiz) {
        await supabase
          .from("quiz_questions")
          .delete()
          .eq("quiz_id", quiz.id);

        await supabase
          .from("quizzes")
          .delete()
          .eq("id", quiz.id);
      }
    }

    // 3. Delete videos from DB AND storage
    const { data: videos } = await supabase
      .from("videos")
      .select("id, storage_path")
      .in(
        "module_id",
        (modules || []).map((m) => m.id)
      );

    if (videos?.length > 0) {
      await supabase.storage
        .from("course-videos")
        .remove(videos.map((v) => v.storage_path));

      await supabase
        .from("videos")
        .delete()
        .in(
          "id",
          videos.map((v) => v.id)
        );
    }

    // 4. Delete student progress
    await supabase
      .from("student_video_progress")
      .delete()
      .eq("course_id", id);

    // 5. Delete purchases
    await supabase
      .from("course_purchases")
      .delete()
      .eq("course_id", id);

    // 6. Delete modules
    await supabase
      .from("modules")
      .delete()
      .eq("course_id", id);

    // 7. Delete the course itself
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete course.");
      return;
    }

    alert("Course deleted successfully.");
    navigate("/instructor/dashboard");
  } catch (err) {
    console.error(err);
    alert("Something went wrong while deleting.");
  }
};

  if (loading || !course)
    return (
      <p
        style={{
          color: "#334155",
          padding: "40px",
          textAlign: "center",
          fontSize: "18px",
        }}
      >
        Loading course...
      </p>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        padding: "40px 10vw",
        background: "linear-gradient(to bottom right, #eef3ff, #f8fbff)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Course Title Card */}
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#0f172a",
          }}
        >
          {course.title}
        </h1>

        <p style={{ fontSize: "17px", color: "#475569", marginTop: "10px" }}>
          {course.description}
        </p>

        {/* Instructor Actions */}
        {isInstructor && (
          <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
            <button
              onClick={() => navigate(`/course/${id}/edit`)}
              style={{
                background: "#3b82f6",
                color: "white",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Edit Course
            </button>

            <button
              onClick={handleDeleteCourse}
              style={{
                background: "#ef4444",
                color: "white",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Delete Course
            </button>
          </div>
        )}

        {/* Buy Button */}
        {!purchased && isStudent && (
          <button
            onClick={handleBuyCourse}
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              background: "#10b981",
              color: "white",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Buy Course ₹{course.price || 500}
          </button>
        )}
      </div>

      {/* MODULES SECTION */}

      <h2
        style={{
          fontSize: "28px",
          fontWeight: "600",
          color: "#1e293b",
          marginBottom: "20px",
        }}
      >
        Course Modules
      </h2>

      {modules.map((m) => {
  const isOpen = openModule === m.id;

  return (
    <div
      key={m.id}
      style={{
        background: "white",
        marginBottom: "20px",
        borderRadius: "14px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.06)",
        overflow: "hidden",
        transition: "0.3s",
      }}
    >
      {/* ----- MODULE HEADER ----- */}
      <div
        onClick={() => setOpenModule(isOpen ? null : m.id)}
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: "#f8fafc",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "600",
            margin: 0,
            color: "#0f172a",
          }}
        >
          {m.title}
        </h3>

        <span
          style={{
            fontSize: "22px",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "0.3s",
            color: "#475569",
          }}
        >
          ▶
        </span>
      </div>

      {/* ----- MODULE CONTENT (videos + quiz) ----- */}
      <div
        style={{
          maxHeight: isOpen ? "2000px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.4s ease",
          padding: isOpen ? "20px" : "0px 20px",
          background: "white",
        }}
      >
        {/* --- Videos --- */}
        {m.videos.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "16px" }}>
            No videos in this module.
          </p>
        ) : (
          m.videos.map((v) => {
            const done = watched.includes(String(v.id));

            return (
              <div
                key={v.id}
                style={{
                  marginBottom: "25px",
                  background: "#f1f5f9",
                  padding: "15px",
                  borderRadius: "12px",
                }}
              >
                {purchased || isInstructor ? (
                  <>
                    <video
                      src={v.url}
                      controls
                      style={{
                        width: "100%",
                        maxWidth: "800px",
                        display: "block",
                        borderRadius: "12px",
                        background: "#000",
                        marginBottom: "12px",
                      }}
                    />

                    {isStudent && (
                      <button
                        disabled={done}
                        onClick={() => markWatched(v.id)}
                        style={{
                          background: done ? "#22c55e" : "#3b82f6",
                          color: "white",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        {done ? "Watched ✔" : "Mark as Watched"}
                      </button>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      height: "200px",
                      background: "#e2e8f0",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#475569",
                    }}
                  >
                    🔒 Locked — Please buy this course
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* --- QUIZ BUTTON --- */}
        {m.quiz ? (
          <button
            onClick={() => navigate(`/quiz/${m.quiz.id}/attempt`)}
            style={{
              background: purchased ? "#f59e0b" : "#cbd5e1",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: purchased ? "pointer" : "not-allowed",
              fontSize: "16px",
              marginTop: "10px",
            }}
            disabled={!purchased}
          >
            {purchased ? "Take Quiz" : "Unlock to Take Quiz"}
          </button>
        ) : (
          isInstructor && (
            <button
              onClick={() => navigate(`/module/${m.id}/quiz/create`)}
              style={{
                background: "#7c3aed",
                color: "white",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "16px",
                marginTop: "10px",
              }}
            >
              + Create Quiz
            </button>
          )
        )}
      </div>
    </div>
  );
})}

    </div>
  );
}
