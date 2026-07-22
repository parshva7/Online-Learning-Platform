import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function QuizCreate() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [moduleRow, setModuleRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState("Module Quiz");

  const [questions, setQuestions] = useState(
    Array.from({ length: 5 }).map(() => ({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
    }))
  );

  // FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    fetchUser();
  }, []);

  // LOAD MODULE
  useEffect(() => {
    const loadModule = async () => {
      const { data } = await supabase
        .from("modules")
        .select("id, title, course_id")
        .eq("id", moduleId)
        .single();

      setModuleRow(data);
      setLoading(false);
    };
    loadModule();
  }, [moduleId]);

  const updateQuestion = (i, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[i][field] = value;
      return copy;
    });
  };

  const handleSaveQuiz = async () => {
    if (!moduleRow) return alert("Invalid module.");
    if (!currentUser) return alert("Login required.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d) {
        alert(`Fill all fields in Question ${i + 1}`);
        return;
      }
    }

    setSaving(true);

    try {
      const { data: quiz } = await supabase
        .from("quizzes")
        .insert({
          module_id: moduleRow.id,
          instructor_id: currentUser.id,
          title,
        })
        .select("id")
        .single();

      const quizQuestions = questions.map((q) => ({
        quiz_id: quiz.id,
        ...q,
      }));

      await supabase.from("quiz_questions").insert(quizQuestions);

      alert("Quiz created successfully!");
      navigate(`/courses/${moduleRow.course_id}`);
    } catch (err) {
      alert("Error: " + err.message);
    }

    setSaving(false);
  };

  if (loading)
    return (
      <div style={{ color: "white", padding: 20 }}>Loading module...</div>
    );

  if (!moduleRow)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Invalid Module ID.
      </div>
    );

 return (
  <div
    style={{
      minHeight: "100vh",
      width: "100vw",
      background: "linear-gradient(to bottom right, #eef3ff, #f8fbff)",
      padding: "40px 0",
      display: "flex",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      style={{
        width: "90%",
        maxWidth: "1200px",
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "20px",
          color: "#0f172a",
        }}
      >
        Create Quiz for: {moduleRow.title}
      </h1>

      {/* Quiz title */}
      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "30px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          fontSize: "16px",
          background: "#ffffff",
          color: "#1e293b",
        }}
      />

      {/* Questions */}
      {questions.map((q, i) => (
        <div
          key={i}
          style={{
            background: "#f9fbff",
            padding: "22px",
            borderRadius: "12px",
            border: "1px solid #e0e6f0",
            marginBottom: "25px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "15px",
              color: "#1e293b",
            }}
          >
            Question {i + 1}
          </h2>

          {/* Question Text */}
          <input
            placeholder="Question text"
            value={q.question_text}
            onChange={(e) => updateQuestion(i, "question_text", e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              marginBottom: "15px",
              fontSize: "15px",
              background: "white",
              color: "#0f172a",
            }}
          />

          {/* Options */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {["a", "b", "c", "d"].map((opt) => (
              <input
                key={opt}
                placeholder={`Option ${opt.toUpperCase()}`}
                value={q[`option_${opt}`]}
                onChange={(e) =>
                  updateQuestion(i, `option_${opt}`, e.target.value)
                }
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "white",
                  color: "#1e293b",
                }}
              />
            ))}
          </div>

          {/* Correct Option Select */}
          <label
            style={{
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "6px",
              display: "block",
            }}
          >
            Correct Option:
          </label>

          <select
            value={q.correct_option}
            onChange={(e) =>
              updateQuestion(i, "correct_option", e.target.value)
            }
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#1e293b",
              width: "200px",
            }}
          >
            <option value="A">Option A</option>
            <option value="B">Option B</option>
            <option value="C">Option C</option>
            <option value="D">Option D</option>
          </select>
        </div>
      ))}

      {/* Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleSaveQuiz}
          disabled={saving}
          style={{
            padding: "14px 22px",
            background: saving ? "#94a3b8" : "#3b82f6",
            color: "white",
            borderRadius: "10px",
            fontSize: "17px",
            fontWeight: "600",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            marginRight: "12px",
          }}
        >
          {saving ? "Saving..." : "Create Quiz"}
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "14px 22px",
            background: "#475569",
            color: "white",
            borderRadius: "10px",
            fontSize: "17px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

}
