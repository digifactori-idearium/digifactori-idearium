import React from 'react';

import Home from './Home';

import { useUser } from '@/providers/UserProvider';

const LogOut: React.FC = () => {
  const user = useUser();
  user.removeToken();

  return <Home />;
};

export default LogOut;
