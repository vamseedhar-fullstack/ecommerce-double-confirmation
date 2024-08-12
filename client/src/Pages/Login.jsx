import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/login', {
        username,
        password,
        role,
      });

      if (response.data.success) {
        console.log('Login successful!');
        console.log('Role:', response.data.role);
      } else {
        console.log('Login failed:', response.data.message);
      }
    } catch (error) {
      console.log('An error occurred:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
        <button  className="buttinton" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Signup;
