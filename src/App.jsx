import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { BuildCompanyProvider } from './context/BuildCompany/BuildCompanyProvider';
import { AppProvider } from './context/AppContext/AppProvider';
import { AuthProvider } from './context/AuthContext/AuthProvider';
import { ConceptualizationProvider } from './context/Conceptualization/ConceptualizationProvider';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BuildCompanyProvider>
          <ConceptualizationProvider>
            <AppRoutes />
          </ConceptualizationProvider>
        </BuildCompanyProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
