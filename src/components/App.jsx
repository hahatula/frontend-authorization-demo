import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppContext from '../contexts/AppContext';
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

  const location = useLocation();

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
          // send them to the stored in state location or to '/ducks' if nothing saved
          const rediretPath = location.state?.from?.pathname || '/ducks';
          navigate(rediretPath);
        }
      })
      .catch(console.error);
  };

  return (
    <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <Routes>
        <Route
          path="/ducks"
          element={
            <ProtectedRoute>
              <Ducks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile userData={userData} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute anonymous>
              <div className="loginContainer">
                <Login handleLogin={handleLogin} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute anonymous>
              <div className="registerContainer">
                <Register handleRegistration={handleRegistration} />
              </div>
            </ProtectedRoute>
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
    </AppContext.Provider>
  );
}

export default App;
