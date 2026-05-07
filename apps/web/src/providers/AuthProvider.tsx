import React, { createContext, useContext, useState, ReactNode } from 'react';

type Mode = 'login' | 'register' | 'reset' | null;

interface AuthContextType {
  switchToLogin: () => void;
  switchToRegister: () => void;
  switchToRest: () => void;
  openAuth: (mode: Mode) => void;
  setMode: (mode: Mode) => void;
  isExpanded: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mode: Mode;
}

const initialState: AuthContextType = {
  switchToLogin: () => {},
  switchToRegister: () => {},
  switchToRest: () => {},
  openAuth: () => {},
  setMode: () => {},
  isExpanded: false,
  isOpen: false,
  setIsOpen: () => {},
  mode: 'login',
};

const AuthContext = createContext<AuthContextType>(initialState);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children?: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isExpanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('login');

  const playExpandingAnimation = () => {
    setExpanded(true);
    setTimeout(() => setExpanded(false), 2300 - 1500);
  };

  const openAuth = (newMode: Mode) => {
    playExpandingAnimation();
    setIsOpen(true);
    setTimeout(() => setMode(newMode), 400);
  };

  const switchToRegister = () => openAuth('register');
  const switchToLogin = () => openAuth('login');
  const switchToRest = () => openAuth('reset');

  const contextValue = {
    switchToRegister,
    switchToLogin,
    switchToRest,
    openAuth,
    setMode,
    mode,
    isExpanded,
    isOpen,
    setIsOpen,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
