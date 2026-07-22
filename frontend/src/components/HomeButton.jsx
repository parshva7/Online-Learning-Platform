import { Link } from "react-router-dom";

export default function HomeButton() {
  return (
    <Link
      to="/"
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        background: "#00c853",
        color: "white",
        padding: "8px 14px",
        borderRadius: "6px",
        fontWeight: "bold",
        textDecoration: "none",
        zIndex: 9999,
      }}
    >
      Home
    </Link>
  );
}
