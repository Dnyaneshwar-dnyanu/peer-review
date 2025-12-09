import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import CreateRoom from './pages/CreateRoom';
import ClassRoom from './pages/ClassRoom';

function App() {
     return (
          <BrowserRouter>
               <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />

                    <Route path='/students/dashboard' element={
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

                    <Route path='/room/:roomId' element={
                         <ProtectedRoute allowedRoles={["admin", "student"]}>
                              <ClassRoom />
                         </ProtectedRoute>
                    }
                    />
               </Routes>
          </BrowserRouter>
     )
}

export default App;