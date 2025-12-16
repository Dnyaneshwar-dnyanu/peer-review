import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

     if (loading) return <p>loading....</p>

     if (allowedRoles && !allowedRoles.includes(userRole) || !userRole) {
          return <Navigate to='/login' replace />;
     }

     return children;
}

export default ProtectedRoute;