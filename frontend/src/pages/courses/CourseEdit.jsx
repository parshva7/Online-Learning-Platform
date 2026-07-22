import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { getVideoUrl } from "../../storage";

export default function CourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingModuleId, setUploadingModuleId] = useState(null);
  const [pendingUploads, setPendingUploads] = useState({});

  useEffect(() => {
    loadEverything();
  }, [id]);

  const loadEverything = async () => {
    setLoading(true);
    try {
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      setCourse(courseData);

      const { data: mods } = await supabase
        .from("modules")
        .select("id, title, course_id")
        .eq("course_id", id);

      const modulesWithVideos = [];

      for (let m of mods || []) {
        const { data: vids } = await supabase
          .from("videos")
          .select("id, storage_path")
          .eq("module_id", m.id);

        modulesWithVideos.push({
          ...m,
          videos:
            vids?.map((v) => ({
              id: v.id,
              storage_path: v.storage_path,
              url: getVideoUrl(v.storage_path),
            })) || [],
        });
      }

      setModules(modulesWithVideos);
    } catch (err) {
      console.error(err);
      alert("Failed to load course.");
    }
    setLoading(false);
  };

  const handleUpdateCourseTitle = (newTitle) => {
    setCourse({ ...course, title: newTitle });
  };

  const handleUpdateModuleTitle = async (moduleId, newTitle) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, title: newTitle } : m))
    );

    await supabase.from("modules").update({ title: newTitle }).eq("id", moduleId);
  };

  const handleAddModule = async () => {
    const defaultTitle = `New Module ${modules.length + 1}`;

    const { data, error } = await supabase
      .from("modules")
      .insert({ course_id: id, title: defaultTitle })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      alert("Failed to add module.");
      return;
    }

    setModules([...modules, { ...data, videos: [] }]);
  };

  const handleChooseFile = (moduleId, file) => {
    setPendingUploads({ ...pendingUploads, [moduleId]: file });
  };

  const handleUploadVideo = async (moduleId) => {
    const file = pendingUploads[moduleId];
    if (!file) return alert("Please select a video file.");

    setUploadingModuleId(moduleId);

    try {
      const filePath = `${moduleId}/${Date.now()}-${file.name}`;
      await supabase.storage.from("course-videos").upload(filePath, file);

      const { data: videoData } = await supabase
        .from("videos")
        .insert({ module_id: moduleId, storage_path: filePath })
        .select("*")
        .single();

      const newVideo = {
        id: videoData.id,
        storage_path: videoData.storage_path,
        url: getVideoUrl(videoData.storage_path),
      };

      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, videos: [...m.videos, newVideo] } : m
        )
      );

      setPendingUploads({ ...pendingUploads, [moduleId]: null });
      alert("Uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }

    setUploadingModuleId(null);
  };

  const handleDeleteVideo = async (videoId, storagePath, moduleId) => {
    if (!window.confirm("Delete this video?")) return;

    await supabase.from("videos").delete().eq("id", videoId);
    await supabase.storage.from("course-videos").remove([storagePath]);

    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, videos: m.videos.filter((v) => v.id !== videoId) }
          : m
      )
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await supabase.from("courses").update({ title: course.title }).eq("id", id);
    alert("Course saved!");
    setIsSaving(false);
  };

  const handleAddQuiz = (moduleId) => {
    navigate(`/module/${moduleId}/quiz/create`);
  };

  if (loading)
    return (
      <div style={styles.loadingScreen}>
        <p style={{ color: "white", fontSize: "18px" }}>Loading...</p>
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.mainTitle}>Edit Course: {course.title}</h1>

        <input
          style={styles.input}
          value={course.title}
          onChange={(e) => handleUpdateCourseTitle(e.target.value)}
        />

        <h2 style={styles.sectionTitle}>Modules</h2>

        <button style={styles.addButton} onClick={handleAddModule}>
          + Add Module
        </button>

        {/* MODULES */}
        {modules.map((m) => (
          <div key={m.id} style={styles.moduleCard}>
            <input
              style={styles.input}
              value={m.title}
              onChange={(e) => handleUpdateModuleTitle(m.id, e.target.value)}
            />

            <h3 style={styles.subTitle}>Videos</h3>

            {/* VIDEO LIST */}
            {m.videos.length === 0 ? (
              <p style={{ color: "#555" }}>No videos yet.</p>
            ) : (
              m.videos.map((v) => (
                <div key={v.id} style={styles.videoBox}>
                  <video src={v.url} controls style={styles.video} />
                  <button
                    style={styles.deleteButton}
                    onClick={() =>
                      handleDeleteVideo(v.id, v.storage_path, m.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              ))
            )}

            <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
  
  {/* Hidden Input */}
  <input
    id={`file-${m.id}`}
    type="file"
    accept="video/*"
    style={{ display: "none" }}
    onChange={(e) => handleChooseFile(m.id, e.target.files[0])}
  />

  {/* Custom Button */}
  <button
    onClick={() => document.getElementById(`file-${m.id}`).click()}
    style={{
      padding: "8px 16px",
      background: "#6b7280",
      color: "white",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
    }}
  >
    Choose File
  </button>

  {/* Show File Name */}
  <span style={{ color: "#334155", fontSize: "14px" }}>
    {pendingUploads[m.id] ? pendingUploads[m.id].name : "No file chosen"}
  </span>

  {/* Upload Button */}
  <button
    onClick={() => handleUploadVideo(m.id)}
    disabled={!pendingUploads[m.id] || uploadingModuleId === m.id}
    style={{
      padding: "8px 14px",
      background:
        uploadingModuleId === m.id || !pendingUploads[m.id]
          ? "#cbd5e1"
          : "#22c55e",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor:
        uploadingModuleId === m.id || !pendingUploads[m.id]
          ? "not-allowed"
          : "pointer",
      fontSize: "14px",
    }}
  >
    {uploadingModuleId === m.id ? "Uploading..." : "Upload Video"}
  </button>

  {/* Add Quiz */}
  <button
    onClick={() => handleAddQuiz(m.id)}
    style={{
      padding: "8px 14px",
      background: "#facc15",
      color: "#000",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
    }}
  >
    ➕ Add Quiz
  </button>

</div>

          </div>
        ))}

        {/* SAVE */}
        <div style={{ marginTop: "40px" }}>
          <button style={styles.saveButton} onClick={handleSaveAll}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          <button
            style={styles.backButton}
            onClick={() => navigate(`/courses/${id}`)}
          >
            View Course
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   CSS STYLES (PURE INLINE)
----------------------------------------------------*/

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(to bottom right, #eef4ff, #f8fbff)",
    padding: "40px 0",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "90%",
    maxWidth: "900px",
    background: "white",
    padding: "40px",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  mainTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#334155",
    marginTop: "25px",
  },

  subTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#475569",
    marginTop: "10px",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    borderRadius: "10px",
    marginBottom: "15px",
    fontSize: "15px",
    color: "#1e293b",
  },

  addButton: {
    padding: "10px 16px",
    background: "#7c3aed",
    color: "white",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginBottom: "25px",
  },

  moduleCard: {
    padding: "22px",
    borderRadius: "14px",
    background: "#fbfdff",
    border: "1px solid #dbe1ea",
    marginBottom: "28px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },

  videoBox: {
    background: "white",
    border: "1px solid #e2e8f0",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  video: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "10px",
  },

  deleteButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  uploadButton: (disabled) => ({
    padding: "8px 14px",
    background: disabled ? "#cbd5e1" : "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    marginLeft: "10px",
  }),

  quizButton: {
    padding: "8px 14px",
    background: "#facc15",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
    fontWeight: "600",
  },

  saveButton: {
    padding: "12px 20px",
    background: "#3b82f6",
    color: "white",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },

  backButton: {
    padding: "12px 20px",
    marginLeft: "10px",
    background: "#64748b",
    color: "white",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },

  loadingScreen: {
    minHeight: "100vh",
    background: "#111",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};
