import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function InstructorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    const user = data.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) return alert("Profile not found");
    if (profile.role !== "instructor")
      return alert("You are not an instructor");

    localStorage.setItem("role", "instructor");
    localStorage.setItem("userId", user.id);

    navigate("/instructor/dashboard");
  };

  // Page hero style
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
    fontSize: "40px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#1e293b",
  };

  const captionStyle = {
    fontSize: "17px",
    color: "#475569",
    marginBottom: "28px",
    maxWidth: "500px",
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
    background: "#4c82f7",
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
            border: 1px solid #4c82f7 !important;
          }
          button:hover {
            background: #3a6be6;
          }
        `}
      </style>

      <h1 style={headingStyle}>Instructor Login</h1>
      <p style={captionStyle}>
        Sign in to manage your courses, publish content, track student
        engagement, and continue teaching with ease.
      </p>

      <input
        style={inputStyle}
        type="text"
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
