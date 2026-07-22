import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ------------------ FETCH USER ------------------
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getUser();
  }, []);

  // ------------------ LOAD QUIZ ------------------
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);

      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      setQuiz(quizData);

      const { data: qData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId);

      setQuestions(qData || []);

      setLoading(false);
    };

    loadQuiz();
  }, [quizId]);

  // ------------------ GLOBAL CSS ------------------
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100vw",
      background: "#eef3ff",
      display: "flex",
      justifyContent: "center",
      paddingTop: "40px",
      paddingBottom: "40px",
      boxSizing: "border-box",
    },

    container: {
      width: "95%",
      maxWidth: "850px",
      background: "white",
      padding: "35px",
      borderRadius: "20px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    },

    title: {
      fontSize: "32px",
      fontWeight: "700",
      marginBottom: "25px",
      color: "#0f172a",
      textAlign: "center",
    },

    qCard: {
      marginBottom: "30px",
      padding: "25px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      background: "#f8faff",
    },

    qTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "20px",
      color: "#1e293b",
    },

    submitBtn: {
      width: "100%",
      padding: "15px",
      background: "#2563eb",
      color: "white",
      fontSize: "18px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      marginTop: "15px",
      fontWeight: "600",
    },

    resultCard: {
      width: "90%",
      maxWidth: "600px",
      background: "white",
      padding: "40px",
      borderRadius: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      textAlign: "center",
    },

    pass: { fontSize: "28px", fontWeight: "700", color: "green" },
    fail: { fontSize: "28px", fontWeight: "700", color: "red" },

    backBtn: {
      padding: "12px 20px",
      marginTop: "20px",
      background: "#444",
      color: "white",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "600",
    },
  };

  // ------------------ SELECT OPTION ------------------
  const handleAnswerSelect = (qid, opt) => {
    setAnswers({ ...answers, [qid]: opt });
  };

  // ------------------ SUBMIT QUIZ ------------------
  const handleSubmit = async () => {
    if (!currentUser) return alert("Login first");

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_option) correct++;
    });

    setSubmitting(true);
    try {
      await supabase.from("quiz_responses").insert([
        {
          quiz_id: quizId,
          student_id: currentUser.id,
          score: correct,
          answers,
        },
      ]);

      setScore(correct);
    } catch {
      alert("You already attempted this quiz");
    }
    setSubmitting(false);
  };

  // ------------------ LOADING UI ------------------
  if (loading)
    return (
      <div style={styles.page}>
        <p>Loading quiz...</p>
      </div>
    );

  // ------------------ RESULT UI ------------------
if (score !== null) {
  const percent = Math.round((score / questions.length) * 100);
  const passed = percent >= 70;

  return (
    <div style={styles.page}>
      <div style={styles.resultCard}>
        <h1 style={{ marginBottom: "20px" }}>{quiz.title}</h1>

        <p style={passed ? styles.pass : styles.fail}>
          {passed ? "🎉 You Passed!" : "❌ Failed"}
        </p>

        {/* Score Text */}
        <p style={{ fontSize: "20px", marginTop: "5px", fontWeight: "600" }}>
          Score: {score}/{questions.length}
        </p>

        {/* Progress Bar Container */}
        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#e2e8f0",
            borderRadius: "10px",
            marginTop: "25px",
            overflow: "hidden",
          }}
        >
          {/* Progress Fill */}
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: passed ? "#22c55e" : "#ef4444",
              transition: "width 0.5s ease",
            }}
          ></div>
        </div>

        {/* Percentage Text */}
        <p
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginTop: "10px",
            color: passed ? "green" : "red",
          }}
        >
          {percent}% 
        </p>

        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}

  // ------------------ QUIZ UI ------------------
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>{quiz.title}</h1>

        {questions.map((q, i) => (
          <div key={q.id} style={styles.qCard}>
            <h2 style={styles.qTitle}>
              Q{i + 1}. {q.question_text}
            </h2>

            {["A", "B", "C", "D"].map((opt) => {
              const isSelected = answers[q.id] === opt;

              return (
                <div
                  key={opt}
                  onClick={() => handleAnswerSelect(q.id, opt)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 15px",
                    borderRadius: "12px",
                    border: isSelected
                      ? "2px solid #4f46e5"
                      : "1px solid #d0d7e2",
                    background: isSelected ? "#eef0ff" : "white",
                    color: "#1e293b",
                    marginBottom: "12px",
                    cursor: "pointer",
                    transition: "0.2s",
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(79,70,229,0.25)"
                      : "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Radio Circle */}
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "2px solid #4f46e5",
                      marginRight: "15px",
                      background: isSelected ? "#4f46e5" : "transparent",
                      transition: "0.2s",
                    }}
                  ></div>

                  {/* Option Text */}
                  <span style={{ fontSize: "16px", fontWeight: "500" }}>
                    {opt}) {q[`option_${opt.toLowerCase()}`]}
                  </span>

                  <input type="radio" checked={isSelected} readOnly style={{ display: "none" }} />
                </div>
              );
            })}
          </div>
        ))}

        <button
          style={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
