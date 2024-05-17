import { useContext } from 'react';
import AppContext from '../contexts/AppContext';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ 
    children, 
    anonymous = false // prop anonymus is used to indicate routes that can be visited anonymusly (without authrization). We set it fasle for protected routes 
}) {
  const location = useLocation();
  const from = location.state?.from || '/'; 

  const { isLoggedIn } = useContext(AppContext);

  if (anonymous && isLoggedIn) { // ??? why anonymous AND isLoggedIn? we are creating protected routes in this file...
    return <Navigate to={from} />;
  }

  if (!anonymous && !isLoggedIn) {
    // If user isn't logged in, return a Navigate component that sends the user to /login
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Otherwise, render the protected route's child component.
  return children;
}

export default ProtectedRoute;
