import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function VideoPlayer({ storagePath, onEnded }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (storagePath) {
      setLoading(true);
      setError("");
      generateSignedUrl();
    }
  }, [storagePath]);

  const generateSignedUrl = async () => {
    const { data, error } = await supabase.storage
      .from("course-videos")
      .createSignedUrl(storagePath, 60 * 60);

    if (error) {
      setError("Failed to load video. (" + error.message + ")");
      setLoading(false);
      setVideoUrl("");
      return;
    }

    setVideoUrl(data.signedUrl);
    setLoading(false);
  };

  // -------------------------- CUSTOM CSS --------------------------
  const styles = {
    wrapper: {
      width: "100%",
      maxWidth: "820px",
      margin: "30px auto",
      padding: "20px",
      background: "linear-gradient(145deg, #ffffff, #f1f4ff)",
      borderRadius: "20px",
      boxShadow:
        "0 8px 20px rgba(0,0,0,0.1), inset 0 0 40px rgba(140,165,255,0.15)",
      border: "1px solid #e0e7ff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },

    video: {
      width: "100%",
      borderRadius: "14px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      border: "3px solid #fff",
    },

    loadingBox: {
      padding: "20px",
      fontSize: "18px",
      color: "#444",
      textAlign: "center",
    },

    errorBox: {
      padding: "15px",
      color: "#b91c1c",
      background: "#ffe6e6",
      border: "1px solid #ffbaba",
      borderRadius: "10px",
      textAlign: "center",
      fontWeight: "600",
    },

    glowBar: {
      position: "absolute",
      bottom: "-6px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "60%",
      height: "8px",
      background: "rgba(99,102,241,0.4)",
      filter: "blur(12px)",
      borderRadius: "20px",
    },

    filmDecor: {
      position: "absolute",
      top: "-14px",
      left: "20px",
      width: "90px",
      height: "20px",
      background:
        "repeating-linear-gradient(90deg, #cbd5ff 0, #cbd5ff 10px, #e5e8ff 10px, #e5e8ff 20px)",
      borderRadius: "5px",
      opacity: 0.4,
    },

    filmDecorRight: {
      position: "absolute",
      top: "-14px",
      right: "20px",
      width: "90px",
      height: "20px",
      background:
        "repeating-linear-gradient(90deg, #cbd5ff 0, #cbd5ff 10px, #e5e8ff 10px, #e5e8ff 20px)",
      borderRadius: "5px",
      opacity: 0.4,
    },
  };

  // ---------------------------------------------------------------

  if (loading)
    return (
      <div style={styles.wrapper}>
        <p style={styles.loadingBox}>🎥 Loading video… please wait</p>
      </div>
    );

  if (error)
    return (
      <div style={styles.wrapper}>
        <p style={styles.errorBox}>{error}</p>
      </div>
    );

  if (!videoUrl)
    return (
      <div style={styles.wrapper}>
        <p style={styles.errorBox}>Video unavailable.</p>
      </div>
    );

  return (
    <div style={styles.wrapper}>
      <div style={styles.filmDecor}></div>
      <div style={styles.filmDecorRight}></div>
      <div style={styles.glowBar}></div>

      <video
        src={videoUrl}
        controls
        style={styles.video}
        onEnded={onEnded}
      />
    </div>
  );
}
