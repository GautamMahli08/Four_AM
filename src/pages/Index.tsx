import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return <LoginForm />;
};

export default Index;
