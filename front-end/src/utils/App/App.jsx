// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../../components/Home';
import Login from '../../components/Login';
import Register from '../../components/Register';
import Student from '../../components/StudentDashboard';
import Instructor from '../../components/InstructorDashboard';
import CourseDetail from '../../components/CourseDetail';
import MyCourses from '../../components/MyCourses';
import AddCourse from '../../components/AddCourse';
import DoCourse from '../../components/DoCourse';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<Student />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/add-course" element={<AddCourse/>}/>
        <Route path="/do-course/:courseId" element={<DoCourse />} />
      </Routes>
    </Router>
  );
}

export default App;
