import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { BuildCompanyProvider } from './context/BuildCompany/BuildCompanyProvider';
import { AppProvider } from './context/AppContext/AppProvider';
import { AuthProvider } from './context/AuthContext/AuthProvider';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BuildCompanyProvider>
          <AppRoutes />
        </BuildCompanyProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
