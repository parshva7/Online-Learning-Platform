// src/api/courseApi.js
import { supabase } from "../supabaseClient";

// CREATE COURSE
export async function createCourse(course) {
  const { data, error } = await supabase
    .from("courses")
    .insert([course])
    .select();

  if (error) throw error;
  return data[0];
}

// GET ALL COURSES
export async function getCourses() {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) throw error;
  return data;
}

// GET ONE COURSE
export async function getCourseById(id) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// UPDATE COURSE
export async function updateCourse(id, updates) {
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

// DELETE COURSE
export async function deleteCourse(id) {
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// ✅ GET MODULES + THEIR VIDEOS
export async function getCourseWithModules(courseId) {
  const { data, error } = await supabase
    .from("modules")
    .select(`
      id,
      title,
      description,
      course_id,
      videos (
        id,
        storage_path,
        module_id
      )
    `)
    .eq("course_id", courseId);

  if (error) throw error;
  return data;
}
