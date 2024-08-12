import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './loginpage.css';
import AlertMessage from './AlertMessage'; // Import the AlertMessage component

export const Loginpage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setAlertSeverity('warning');
      setAlertMessage('Please fill in all fields.');
      setAlertOpen(true);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/loginn', {
        username,
        password,
      });
      if (response.data.success) {
        const role = response.data.role;
        console.log(response)
        setAlertSeverity('success');
        setAlertMessage(`Welcome, ${role}!`);
        setAlertOpen(true);
        localStorage.setItem('role',role)
        setTimeout(() => {
          Cookies.set('token', response.data.token);
          navigate(`/${role.toLowerCase()}`, { state: { username, role } }); 
       }, 1000);
      } else {
        setAlertSeverity('error');
        setAlertMessage('Invalid credentials');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setAlertSeverity('error');
      setAlertMessage('An error occurred during login. Please try again later.');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };
  

  return (
   <div className='login-body'>
     <div className="loginPage-container">
      <div className="loginPage-card">
        <a className="loginPage-title">Log in</a>
        <div className="loginPage-inputBox">
          <input
            type="text"
            required="required"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <span className="loginPage-user">Username</span>
        </div>

        <div className="loginPage-inputBox">
          <input
            type="password"
            required="required"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span>Password</span>
        </div>

        <button className="loginPage-enter" onClick={handleLogin}>
          {loading ? 'Logging in...' : 'Enter'}
        </button>

      </div>

      <AlertMessage
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        handleClose={handleAlertClose}
      />
    </div>
   </div>
  );
};
