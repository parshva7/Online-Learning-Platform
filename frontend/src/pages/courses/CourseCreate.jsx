// src/pages/courses/CourseCreate.jsx
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { uploadVideo } from "../../storage";

export default function CourseCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState([{ title: "", videos: [null] }]);
  const [creating, setCreating] = useState(false);

  const addModule = () => {
    setModules([...modules, { title: "", videos: [null] }]);
  };

  const addVideo = (mIndex) => {
    const updated = [...modules];
    updated[mIndex].videos.push(null);
    setModules(updated);
  };

  const updateModule = (index, value) => {
    const updated = [...modules];
    updated[index].title = value;
    setModules(updated);
  };

  // Update a video file; show filename in UI
  const updateVideo = (mIndex, vIndex, file) => {
    const updated = [...modules];
    updated[mIndex].videos[vIndex] = file || null;
    setModules(updated);
  };

  const removeVideo = (mIndex, vIndex) => {
    const updated = [...modules];
    updated[mIndex].videos.splice(vIndex, 1);
    // Ensure at least one slot remains
    if (updated[mIndex].videos.length === 0) updated[mIndex].videos.push(null);
    setModules(updated);
  };

  const createCourse = async () => {
    if (!title.trim()) return alert("Please enter a course title.");
    setCreating(true);

    try {
      const { data: currentUser } = await supabase.auth.getUser();
      const user = currentUser?.user;
      if (!user) {
        setCreating(false);
        return alert("You must be logged in to create a course.");
      }

      // Insert course
      const { data: course, error: courseErr } = await supabase
        .from("courses")
        .insert([{ title: title.trim(), description: description.trim(), instructor_id: user.id }])
        .select()
        .single();

      if (courseErr) throw courseErr;

      // Create modules and upload videos
      for (let m of modules) {
        // skip empty module title check if you want; here we create anyway
        const { data: moduleRow, error: moduleErr } = await supabase
          .from("modules")
          .insert([{ title: m.title || "Untitled Module", course_id: course.id }])
          .select()
          .single();

        if (moduleErr) {
          console.error("Module insert error", moduleErr);
          // continue to next module instead of failing everything
          continue;
        }

        // Upload videos for this module
        for (let file of m.videos) {
          if (!file) {
            console.log("Skipping empty file slot");
            continue;
          }

          // uploadVideo should return object like { path: "module-id/filename.mp4" } on success
          const uploaded = await uploadVideo(file); // your helper
          if (!uploaded || !uploaded.path) {
            console.warn("Skipping - upload didn't return path", file?.name);
            continue;
          }

          // insert video row pointing to storage path
          const { error: videoInsertErr } = await supabase
            .from("videos")
            .insert([{ module_id: moduleRow.id, storage_path: uploaded.path }]);

          if (videoInsertErr) {
            console.error("Video insert error", videoInsertErr);
          }
        }
      }

      alert("Course created successfully!");
      window.location.href = "/instructor/dashboard";
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating the course.");
    } finally {
      setCreating(false);
    }
  };

  // ------------------ Inline styles (clean, Coursera-like) ------------------
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #f3f7ff 0%, #fbfdff 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "40px 20px",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    },
    container: {
      width: "100%",
      maxWidth: "980px",
      background: "#ffffff",
      borderRadius: "16px",
      padding: "36px",
      boxShadow: "0 10px 30px rgba(16,24,40,0.08)",
      boxSizing: "border-box",
    },
    title: {
      fontSize: "28px",
      fontWeight: 700,
      textAlign: "center",
      color: "#0f172a",
      marginBottom: "22px",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1px solid #e6eef8",
      boxSizing: "border-box",
      fontSize: "15px",
      color: "#0b1220",
      background: "#fbfdff",
      outline: "none",
    },
    textarea: {
      width: "100%",
      minHeight: "120px",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #e6eef8",
      fontSize: "15px",
      color: "#0b1220",
      resize: "vertical",
      background: "#fbfdff",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: 700,
      color: "#0b1724",
      margin: "26px 0 12px",
    },
    moduleCard: {
      background: "#f7fbff",
      border: "1px solid #e7f0fb",
      padding: "18px",
      borderRadius: "12px",
      marginBottom: "14px",
    },
    moduleHeader: {
      fontWeight: 700,
      marginBottom: "10px",
      color: "#10203a",
    },
    smallInput: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #dde9f7",
      background: "#fff",
      fontSize: "14px",
      color: "#0b1220",
      boxSizing: "border-box",
    },
    fileRow: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginTop: "12px",
      flexWrap: "wrap",
    },
    chooseBtn: {
      background: "#fff",
      border: "1px solid #cbd8f0",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
    },
    filename: {
      padding: "8px 12px",
      borderRadius: "8px",
      background: "#f1f7ff",
      border: "1px dashed #c9ddfb",
      color: "#0b1220",
      fontSize: "13px",
      maxWidth: "520px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    addVideoBtn: {
      background: "#5b6fff",
      color: "white",
      border: "none",
      padding: "10px 14px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: 700,
    },
    addModuleBtn: {
      background: "#1f6feb",
      color: "white",
      border: "none",
      padding: "10px 16px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: 700,
      marginTop: "10px",
    },
    createBtn: {
      marginTop: "26px",
      background: "#0b6bff",
      color: "#fff",
      border: "none",
      padding: "12px 18px",
      borderRadius: "12px",
      fontSize: "16px",
      cursor: "pointer",
      width: "100%",
      fontWeight: 700,
    },
    removeBtn: {
      background: "#ff6b6b",
      color: "white",
      border: "none",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
    },
    helperSmall: {
      color: "#51657a",
      fontSize: "13px",
      marginTop: "6px",
    },
  };
  // ------------------------------------------------------------------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Create a New Course</h2>

        <div style={{ marginBottom: "12px" }}>
          <input
            style={styles.input}
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <textarea
            style={styles.textarea}
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={styles.sectionTitle}>Modules</div>

        {modules.map((m, mi) => (
          <div key={mi} style={styles.moduleCard}>
            <div style={styles.moduleHeader}>Module {mi + 1}</div>

            <input
              style={styles.smallInput}
              placeholder="Module Title"
              value={m.title}
              onChange={(e) => updateModule(mi, e.target.value)}
            />

            <div style={{ marginTop: "12px", fontWeight: 600, color: "#10203a" }}>Videos</div>

            {/* videos list */}
            {m.videos.map((v, vi) => (
              <div key={vi} style={styles.fileRow}>
                {/* custom file chooser button */}
                <label style={styles.chooseBtn}>
                  Choose file
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => updateVideo(mi, vi, e.target.files[0] || null)}
                    style={{ display: "none" }}
                  />
                </label>

                {/* visible filename */}
                <div style={styles.filename}>
                  {v ? v.name : "No file selected"}
                </div>

                {/* Optional remove */}
                <button
                  type="button"
                  onClick={() => removeVideo(mi, vi)}
                  style={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
            ))}

            <div style={{ marginTop: "12px" }}>
              <button type="button" onClick={() => addVideo(mi)} style={styles.addVideoBtn}>
                + Add Video
              </button>
            </div>
          </div>
        ))}

        <div>
          <button type="button" onClick={addModule} style={styles.addModuleBtn}>
            + Add Module
          </button>
        </div>

        <button
          type="button"
          onClick={createCourse}
          style={{ ...styles.createBtn, opacity: creating ? 0.7 : 1, cursor: creating ? "not-allowed" : "pointer" }}
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Course"}
        </button>
      </div>
    </div>
  );
}
