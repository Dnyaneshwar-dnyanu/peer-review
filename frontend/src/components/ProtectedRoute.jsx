import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoReloadSharp } from "react-icons/io5";

function ProtectedRoute({ children, allowedRoles }) {
     const [userRole, setUserRole] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          checkAuth();
     }, []);

     const checkAuth = async () => {
          let res = await fetch('http://localhost:3000/api/auth/validateUser', {
               method: 'GET',
               credentials: "include"
          });

          if (res.status === 200) {
               let data = await res.json();
               if (!data.auth) {
                    setUserRole(undefined);
               }
               else {
                    setUserRole(data.user.role);
               }
          }

          setLoading(false);
     }

     if (loading) 
         return  <div className="min-h-screen w-full absolute top-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black">
                   <IoReloadSharp className="loader" />
                 </div>

     if (allowedRoles && !allowedRoles.includes(userRole) || !userRole) {
          return <Navigate to='/login' replace />;
     }

     return children;
}

export default ProtectedRoute;