import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";

import Home from "./Home";
import HomeButton from "./components/HomeButton";

// Auth
import StudentSignup from "./auth/student/StudentSignup";
import StudentLogin from "./auth/student/StudentLogin";
import InstructorSignup from "./auth/instructor/InstructorSignup";
import InstructorLogin from "./auth/instructor/InstructorLogin";

// Routes
import StudentRoute from "./routes/StudentRoute";
import InstructorRoute from "./routes/InstructorRoute";

// Dashboards
import StudentDashboard from "./dashboard/StudentDashboard";
import InstructorDashboard from "./dashboard/InstructorDashboard";

// Course Pages
import CourseList from "./pages/courses/CourseList";
import CourseCreate from "./pages/courses/CourseCreate";
import CourseView from "./pages/courses/CourseView";
import CourseEdit from "./pages/courses/CourseEdit";
import CourseDetail from "./pages/courses/CourseDetail";
import VideoPlayer from "./pages/courses/VideoPlayer";
import QuizCreate from "./pages/courses/QuizCreate";
import QuizAttempt from "./pages/courses/QuizAttempt";

export default function App() {
  return (
    <BrowserRouter>

      {/* ✅ Home button visible on all pages */}
      <HomeButton />

      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Student Auth */}
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/student/login" element={<StudentLogin />} />

        {/* Instructor Auth */}
        <Route path="/instructor/signup" element={<InstructorSignup />} />
        <Route path="/instructor/login" element={<InstructorLogin />} />

        {/* Student Dashboard */}
        <Route
          path="/student/dashboard"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />

        {/* Instructor Dashboard */}
        <Route
          path="/instructor/dashboard"
          element={
            <InstructorRoute>
              <InstructorDashboard />
            </InstructorRoute>
          }
        />

        {/* Courses */}
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseView />} />
        <Route path="/courses/:id/detail" element={<CourseDetail />} /> 

        {/* Quizzes */}
        <Route path="/module/:moduleId/quiz/create" element={<QuizCreate />} />
        <Route path="/quiz/:quizId/attempt" element={<QuizAttempt />} />

        {/* Create course — only for instructors */}
        <Route
          path="/courses/create"
          element={
            <InstructorRoute>
              <CourseCreate />
            </InstructorRoute>
          }
        />

        {/* Edit course */}
        <Route path="/course/:id/edit" element={<CourseEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

// (Optional) Layout component if needed later
function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}
