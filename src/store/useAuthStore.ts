import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  role: 'manager' | 'operator' | 'driver';
  assignedVehicleIds: string[];
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

// Demo users for the FSaaS system
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'manager-gautam@demo.com': {
    password: 'mahli@123',
    user: {
      id: 'mgr-001',
      email: 'manager-gautam@demo.com',
      role: 'manager',
      assignedVehicleIds: ['VHC-001', 'VHC-002', 'VHC-003', 'VHC-004', 'VHC-005'],
      name: 'Gautam Mahli'
    }
  },
  'operator@demo.com': {
    password: 'Demo@123',
    user: {
      id: 'opr-001',
      email: 'operator@demo.com',
      role: 'operator',
      assignedVehicleIds: ['VHC-001', 'VHC-002', 'VHC-003'],
      name: 'Deepak Mahli'
    }
  },
  'driver@demo.com': {
    password: 'Demo@123',
    user: {
      id: 'drv-001',
      email: 'driver@demo.com',
      role: 'driver',
      assignedVehicleIds: ['VHC-001'],
      name: 'Praveen Mahli'
    }
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const demoUser = DEMO_USERS[credentials.email];
        if (demoUser && demoUser.password === credentials.password) {
          const token = `demo-jwt-${Date.now()}`;
          set({
            user: demoUser.user,
            token,
            isAuthenticated: true
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      checkAuth: () => {
        const { user, token } = get();
        return !!(user && token);
      }
    }),
    {
      name: 'fsaas-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);