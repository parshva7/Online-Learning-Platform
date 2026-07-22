import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function CourseDetail() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ watched_videos: 0, total_videos: 0 });
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);

  const role = localStorage.getItem("role");
  const isStudent = role === "student";

  useEffect(() => {
    if (!courseId) return;
    loadAll();
  }, [courseId]);

  async function loadAll() {
    setLoading(true);
    await fetchCourse();
    await fetchProgress();
    await fetchCompleted();
    setLoading(false);
  }

  async function fetchCourse() {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        id, title, description,
        modules (id, title, videos (id, storage_path))
      `)
      .eq("id", courseId)
      .single();
    if (error) return console.error(error);
    const withUrls = {
      ...data,
      modules: data.modules.map((m) => ({
        ...m,
        videos: m.videos.map((v) => ({
          ...v,
          url: supabase.storage
            .from("course-videos")
            .getPublicUrl(v.storage_path).data.publicUrl,
        })),
      })),
    };
    setCourse(withUrls);
  }

  async function fetchProgress() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;
    const { data, error } = await supabase
      .from("student_course_progress")
      .select("watched_videos, total_videos")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (error) return console.error(error);
    setProgress({
      watched_videos: data?.watched_videos || 0,
      total_videos: data?.total_videos || 0,
    });
  }

  async function fetchCompleted() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;
    const { data, error } = await supabase
      .from("student_video_progress")
      .select("video_id")
      .eq("student_id", user.id)
      .eq("watched", true);
    if (error) return console.error(error);
    setCompleted(data.map((r) => r.video_id));
  }

  async function handleMarkAsWatched(videoId) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;
    setMarking(videoId);

    const { error } = await supabase
      .from("student_video_progress")
      .upsert({
        student_id: user.id,
        video_id: videoId,
        watched: true,
        watched_at: new Date().toISOString(),
      }, { onConflict: "student_id,video_id" });

    if (error) console.error(error);
    await fetchProgress();
    await fetchCompleted();
    setMarking(null);
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!course) return <p>Course not found.</p>;

  const { watched_videos, total_videos } = progress;
  const percent = Math.round((watched_videos / (total_videos || 1)) * 100);

  return (
    <div style={{ padding: 20 }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>

      <div style={{ background: "#eee", borderRadius: 8, height: 16, width: 240, margin: "12px 0" }}>
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: percent === 100 ? "limegreen" : "#36a3f7",
            transition: "width 0.25s",
          }}
        />
      </div>
      <p><strong>{percent}%</strong> ({watched_videos}/{total_videos})</p>

      {course.modules.map((m) => (
        <div key={m.id}>
          <h2>{m.title}</h2>
          {m.videos.map((v) => {
            const done = completed.includes(v.id);
            return (
              <div key={v.id} style={{ marginBottom: 10 }}>
                <video width="400" controls src={v.url}></video>
                {isStudent && (
                  <button
                    onClick={() => handleMarkAsWatched(v.id)}
                    disabled={done || marking === v.id}
                    style={{
                      background: done ? "green" : "#36a3f7",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      marginTop: 5,
                      cursor: done ? "not-allowed" : "pointer",
                    }}
                  >
                    {done ? "Watched ✅" : marking === v.id ? "Marking..." : "Mark as Watched"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
