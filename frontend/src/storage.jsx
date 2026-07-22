import { supabase } from "./supabaseClient";

// Upload a single video file
export const uploadVideo = async (file) => {
  if (!file) return null;

  try {
    const ext = file.name.split(".").pop();
    const name = `${crypto.randomUUID()}.${ext}`;
    const fullPath = `videos/${name}`;

    const { error: uploadErr } = await supabase.storage
      .from("course-videos")
      .upload(fullPath, file);

    if (uploadErr) {
      console.log("Video upload failed:", uploadErr);
      return null;
    }

    const { data } = supabase.storage
      .from("course-videos")
      .getPublicUrl(fullPath);

    return {
      path: fullPath,
      url: data?.publicUrl || null
    };
  } catch (err) {
    console.log("Unexpected error:", err);
    return null;
  }
};

// Convert a stored path to a public URL
export const getVideoUrl = (path) => {
  if (!path) return null;

  const { data } = supabase.storage
    .from("course-videos")
    .getPublicUrl(path);

  return data?.publicUrl || null;
};
