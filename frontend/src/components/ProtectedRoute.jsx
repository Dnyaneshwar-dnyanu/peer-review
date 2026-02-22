import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { IoReloadSharp } from "react-icons/io5";
import Loader from "./Loader";

function ProtectedRoute({ children, allowedRoles }) {
     const [userRole, setUserRole] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          checkAuth();
     }, []);

     const checkAuth = async () => {
          try {
               const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/validateUser`, {
                    withCredentials: true
               });

               if (!res.data.auth) {
                    setUserRole(undefined);
               } else {
                    setUserRole(res.data.user.role);
               }
          } catch (err) {
               console.error(err);
               setUserRole(undefined);
               toast.error("Something error occurred!");

          } finally {
               setLoading(false);
          }
     }

     if (loading) return <Loader />

     if (!userRole) return <Navigate to='/login' replace />;

     if (allowedRoles && !allowedRoles.includes(userRole) || !userRole) 
          return <Navigate to='/login' replace />;

     return children;
}

export default ProtectedRoute;