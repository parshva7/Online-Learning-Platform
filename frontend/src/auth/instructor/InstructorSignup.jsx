import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function InstructorSignup() {
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
      role: "instructor",
    });

    alert("Instructor Signup Successful!");
  };

  // Coursera-style layout
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

      <h1 style={headingStyle}>Instructor Signup</h1>
      <p style={captionStyle}>
        Join as an instructor and start creating courses, guiding students, 
        and sharing your expertise on our platform.
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
