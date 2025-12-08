import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password, userType);

    if (result.success) {
      toast.success('Login successful!');
      navigate(userType === 'admin' ? '/admin' : '/student');
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚌 E-Bus System</h1>
          <p>Real-time Bus Tracking & Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User Type</label>
            <select
              className="form-control"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="student">Student/Faculty</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Credentials:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setEmail('admin@ebus.com');
                setPassword('admin123');
                setUserType('admin');
              }}
            >
              Autofill Admin
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setEmail('aarav.sharma@example.com');
                setPassword('anypassword');
                setUserType('student');
              }}
            >
              Autofill Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
