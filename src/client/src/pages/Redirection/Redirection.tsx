import { Navigate, useLocation } from 'react-router-dom';

export default function RedirectionPage() {
    const location = useLocation();
    const token = location.search.substr(1);
    localStorage.setItem('token', token);
    return <Navigate to="/" />;
  }