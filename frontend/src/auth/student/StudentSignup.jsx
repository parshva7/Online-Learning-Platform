import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function StudentSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return alert(error.message);

    await supabase.from("profiles").insert({
      id: data.user.id,
      name: name,
      role: "student",
    });

    alert("Student Signup Successful!");
  };

  // Hero layout
  const pageStyle = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: "10vw",
    background: "linear-gradient(to bottom right, #eef7ff, #f7fbff)",
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
    maxWidth: "480px",
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

      <h1 style={headingStyle}>Student Signup</h1>
      <p style={captionStyle}>
        Create your student account to access courses, track your progress,
        learn new skills and grow at your own pace.
      </p>

      <input
        style={inputStyle}
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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

      <button style={buttonStyle} onClick={handleSignup}>
        Create Account
      </button>
    </div>
  );
}
