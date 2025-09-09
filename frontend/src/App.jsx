import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { UserProvider } from './context/user.context';
import { BrowserRouter as Router } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </Router>
  );
};

export default App;
