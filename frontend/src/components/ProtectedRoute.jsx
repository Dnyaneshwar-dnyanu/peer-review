import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "./Loader";

function ProtectedRoute({ children, allowedRoles }) {
     const [userRole, setUserRole] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          checkAuth();
     }, []);

     const checkAuth = async () => {
          const token = localStorage.getItem("token");
          if (!token) {
               setUserRole(undefined);
               setLoading(false);
               return;
          }

          try {
               const res = await api.get(`/api/auth/validateUser`);

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