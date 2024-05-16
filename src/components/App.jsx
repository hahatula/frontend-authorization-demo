import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Ducks from './Ducks';
import Login from './Login';
import MyProfile from './MyProfile';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import './styles/App.css';
import * as auth from '../utils/auth';
import * as api from '../utils/api';
import { setToken, getToken } from '../utils/token';

function App() {
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const jwt = getToken();
      
    if (!jwt) {
      return;
    }
  
    api
    .getUserInfo(jwt)
    .then(({ username, email }) => {
      // If the response is successful, log the user in, save their 
      // data to state, and navigate them to /ducks.
      setIsLoggedIn(true);
      setUserData({ username, email });
      navigate("/ducks");
    })
    .catch(console.error);

  }, []);

  const handleRegistration = ({
    username,
    email,
    password,
    confirmPassword,
  }) => {
    if (password === confirmPassword) {
      auth
        .register(username, password, email)
        .then(() => {
          navigate('/login');
        })
        .catch(console.error);
    }
  };

  const handleLogin = ({ username, password }) => {
    // If username or password empty, return without sending a request.
    if (!username || !password) {
      return;
    }

    // We pass the username and password as positional arguments. The
    // authorize function is set up to rename `username` to `identifier`
    // before sending a request to the server, because that is what the
    // API is expecting.
    auth
      .authorize(username, password)
      .then((data) => {
        // Verify that a jwt is included before logging the user in.
        if (data.jwt) {
          setToken(data.jwt); // save the token to local storage
          setUserData(data.user); // save user's data to state
          setIsLoggedIn(true); // log the user in
          navigate('/ducks'); // send them to /ducks
        }
      })
      .catch(console.error);
  };

  return (
    <Routes>
      <Route
        path="/ducks"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Ducks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-profile"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <MyProfile userData={userData} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <div className="loginContainer">
            <Login handleLogin={handleLogin} />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="registerContainer">
            <Register handleRegistration={handleRegistration} />
          </div>
        }
      />
      <Route
        path="*"
        element={
          isLoggedIn ? (
            <Navigate to="/ducks" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
