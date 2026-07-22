import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    localStorage.removeItem("role");
    localStorage.removeItem("student");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    localStorage.setItem(
      "student",
      JSON.stringify({
        id: user.id,
        email: user.email,
      })
    );

    localStorage.setItem("role", "student");

    window.location.href = "/student/dashboard";
  };

  // Page background + hero layout
  const pageStyle = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: "10vw",
    background: "linear-gradient(to bottom right, #eef3ff, #f8fbff)",
    fontFamily: "Arial, sans-serif",
  };

  const headingStyle = {
    fontSize: "38px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#1e293b",
  };

  const captionStyle = {
    fontSize: "17px",
    color: "#475569",
    marginBottom: "30px",
    maxWidth: "460px",
    lineHeight: "1.5",
  };

  const inputStyle = {
    width: "340px",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #cdd4df",
    backgroundColor: "white",
    color: "black",
    fontSize: "15px",
    outline: "none",
    transition: "border 0.2s",
  };

  const buttonStyle = {
    width: "340px",
    padding: "12px",
    marginTop: "14px",
    background: "#3b82f6",
    color: "white",
    fontSize: "17px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "0.25s",
  };

  return (
    <div style={pageStyle}>
      <style>
        {`
          input:focus {
            border: 1px solid #3b82f6 !important;
          }
          button:hover {
            background: #2563eb;
          }
        `}
      </style>

      <h1 style={headingStyle}>Student Login</h1>
      <p style={captionStyle}>
        Welcome back. Sign in to continue your learning journey and access your
        courses, progress and dashboard.
      </p>

      <input
        style={inputStyle}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={inputStyle}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={buttonStyle} onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
