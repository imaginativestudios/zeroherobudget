import { Navigate } from 'react-router-dom';

const Auth = () => {
  // In prototype mode, always redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Auth;
