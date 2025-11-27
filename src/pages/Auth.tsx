import { Navigate } from 'react-router-dom';

const Auth = () => {
  // Redirect to landing page which has the auth modal
  return <Navigate to="/" replace />;
};

export default Auth;
