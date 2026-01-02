import { createContext, useState, useEffect } from 'react';
import axiosClient from '../apis/axiosClient';
import { jwtDecode } from "jwt-decode";
export const AuthContext = createContext();
AuthContext.displayName = "AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  useEffect(() => {
    let isMounted = true; // tránh setState khi component unmount
    const checkToken = async () => {
      
      if (token && isMounted) {
        
        setUser(jwtDecode(token));
      }
      if (isMounted) setLoading(false);
    };

    checkToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(jwtDecode(res.data.token));
    } catch (err) {
      console.error("Login failed:", err);
      throw err; // Cho component gọi login handle tiếp
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
