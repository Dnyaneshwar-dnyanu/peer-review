import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import CreateRoom from './pages/CreateRoom';
import TeacherRoom from './pages/TeacherRoom';
import StudentRoom from './pages/StudentRoom';
import ProjectInfo from './pages/ProjectInfo';
import Home from './pages/Home';

function App() {
     return (
          <BrowserRouter>
               <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/login/forgotpassword' element={<ForgotPassword />} />

                    <Route path='/student/dashboard' element={
                         <ProtectedRoute allowedRoles={["student"]}>
                              <StudentDashboard />
                         </ProtectedRoute>
                    }
                    />

                    <Route path='/admin/dashboard' element={
                         <ProtectedRoute allowedRoles={["admin"]}>
                              <TeacherDashboard />
                         </ProtectedRoute>
                    }
                    />

                    <Route path='/admin/createRoom' element={
                         <ProtectedRoute allowedRoles={["admin"]}>
                              <CreateRoom />
                         </ProtectedRoute>
                    }
                    />

                    <Route path='/admin/room/:roomID' element={
                         <ProtectedRoute allowedRoles={["admin"]}>
                              <TeacherRoom />
                         </ProtectedRoute>
                    }
                    />

                    <Route path='/admin/room/:roomID/project/:projectID' element={
                         <ProtectedRoute allowedRoles={["admin"]}>
                              <ProjectInfo />
                         </ProtectedRoute>
                    }
                    />

                    <Route path='/student/room/:roomID' element={
                         <ProtectedRoute allowedRoles={["student"]}>
                              <StudentRoom />
                         </ProtectedRoute>
                    }
                    />
               </Routes>
          </BrowserRouter>
     )
}

export default App;