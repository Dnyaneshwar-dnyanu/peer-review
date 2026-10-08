import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "./Loader";

function ProtectedRoute({ children, allowedRoles }) {
     const [userRole, setUserRole] = useState(null);
     const [loading, setLoading] = useState(true);
     const [errorMsg, setErrorMsg] = useState(null);

     useEffect(() => {
          checkAuth();
     }, []);

     const checkAuth = async () => {
          try {
               const res = await api.get(`/api/auth/validateUser`);

               if (!res.data.auth) {
                    setUserRole(undefined);
               } else {
                    setUserRole(res.data.user.role);
               }
          } catch (err) {
               console.error(err);
               if (err.response && err.response.status === 401) {
                    setUserRole(undefined);
               } else {
                    setErrorMsg("Network or server error occurred. Please check your connection.");
                    toast.error("Network or server error occurred!");
               }

          } finally {
               setLoading(false);
          }
     }

     if (loading) return <Loader />

     if (errorMsg) return <div className="flex h-screen items-center justify-center text-red-500 font-bold">{errorMsg}</div>;

     if (!userRole) return <Navigate to='/login' replace />;

     if (allowedRoles && !allowedRoles.includes(userRole) || !userRole) 
          return <Navigate to='/login' replace />;

     return children;
}

export default ProtectedRoute;