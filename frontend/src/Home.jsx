export default function Home() {
  const pageStyle = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: "10vw",
    background: "linear-gradient(to bottom right, #eef3ff, #f8fbff)",
    fontFamily: "Arial, sans-serif",
  };

  const headingStyle = {
    fontSize: "42px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#1e293b",
  };

  const subTextStyle = {
    fontSize: "18px",
    color: "#475569",
    marginBottom: "30px",
    maxWidth: "460px",
    lineHeight: "1.5",
  };

  const btnRow = {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  };

  const buttonStyle = {
    padding: "12px 24px",
    textDecoration: "none",
    color: "white",
    background: "#2563eb",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    transition: "0.25s",
  };

  const secondaryBtn = {
    ...buttonStyle,
    background: "#0ea5e9",
  };

  return (
    <div style={pageStyle}>
      <style>
        {`
          a:hover {
            opacity: 0.85;
          }
        `}
      </style>

      {/* Hero Section */}
      <h1 style={headingStyle}>Upgrade Your Skills. Learn Anytime.</h1>
      <p style={subTextStyle}>
        Access courses, track progress, and learn from experienced instructors. 
        Whether you are a student or an instructor, your learning journey starts here.
      </p>

      {/* Buttons */}
      <div style={btnRow}>

        {/* Student Buttons */}
        <a href="/student/login" style={buttonStyle}>Student Login</a>
        <a href="/student/signup" style={secondaryBtn}>Student Signup</a>

        {/* Instructor Buttons */}
        <a href="/instructor/login" style={buttonStyle}>Instructor Login</a>
        <a href="/instructor/signup" style={secondaryBtn}>Instructor Signup</a>
      </div>
    </div>
  );
}
