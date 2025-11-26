import { Navigate } from 'react-router-dom';

const Index = () => {
  // Always redirect to dashboard in prototype mode
  return <Navigate to="/dashboard" replace />;
};

export default Index;
