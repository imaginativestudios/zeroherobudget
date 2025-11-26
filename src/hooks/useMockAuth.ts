import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const MOCK_USER = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    first_name: 'Demo',
    last_name: 'User'
  }
};

export interface AuthState {
  user: typeof MOCK_USER | null;
  session: { user: typeof MOCK_USER } | null;
  loading: boolean;
}

export const useMockAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: MOCK_USER,
    session: { user: MOCK_USER },
    loading: false,
  });

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    return { error: null };
  };

  const resendConfirmation = async (email: string) => {
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    setState({
      user: MOCK_USER,
      session: { user: MOCK_USER },
      loading: false,
    });
    return { error: null };
  };

  const signOut = async () => {
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    return { error: null };
  };

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
  };
};
