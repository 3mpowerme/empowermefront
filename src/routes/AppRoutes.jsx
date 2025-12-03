import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import LoginPage from '../features/Auth/LoginPage';
import SignUpPage from '../features/Auth/SignUpPage';
import ForgotPasswordPage from '../features/Auth/ForgotPasswordPage';
import ConfirmForgotPasswordPage from '../features/Auth/ConfirmForgotPasswordPage';
import VerifyEmailPage from '../features/Auth/VerifyEmailPage';
import BuildCompanyWizardPage from '../features/BuildCompany/BuildCompanyWizardPage';
import DashboardPage from '../features/Dashboard/DashboardPage';
import { DashboardProvider } from '../context/Dashboard/DashboardProvider';
import DashboardBuildCompanyPage from '../features/Dashboard/DashboardBuildCompanyPage';
import DashboardTaxesAndAccountingPage from '../features/Dashboard/DashboardTaxesAndAccountingPage';
import DashboardConceptualizationPage from '../features/Dashboard/DashboardConceptualizationPage';
import DashboardBusinessOrientationPage from '../features/Dashboard/DashboardBusinessOrientationPage';
import DashboardGraphicDesignPage from '../features/Dashboard/DashboardGraphicDesignPage';
import DashboardBusinessProfilePage from '../features/Dashboard/DashboardBusinessProfilePage';
import DashboardLegalAndTaxCompliancePage from '../features/Dashboard/DashboardLegalAndTaxCompliancePage';
import CallbackPage from '../features/Auth/CallbackPage';
import PrivateRoute from '../components/PrivateRoute/PrivateRoute';
import LegalServicesPage from '../features/Dashboard/LegalServices/LegalServicesPage';
import { ShareholderProvider } from '../context/ShareholderContext/ShareholderProvider';
import AccountPage from '../features/Dashboard/Account/AccountPage';
import DashboardHomePage from '../features/Dashboard/DashboardHomePage';
import ConceptualizationPage from '../features/Dashboard/Conceptualization/ConceptualizationPage';
import BusinessOrientationPage from '../features/Dashboard/BusinessOrientation/BusinessOrientationPage';
import { ConceptualizationProvider } from '../context/Conceptualization/ConceptualizationProvider';
import AppointmentsPage from '../features/Dashboard/Appointments/AppointmentsPage';
import LogoDesignPage from '../features/Dashboard/GraphicDesign/LogoDesignPage';
import MonthlyAccounting from '../features/Dashboard/TaxesAndAccounting/MonthlyAccounting';
import { AccountProvider } from '../context/AccountContext/AccountProvider';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
        <Route path="/confirmForgotPassword" element={<ConfirmForgotPasswordPage />} />
        <Route path="/verifyEmail" element={<VerifyEmailPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/buildCompany" element={<BuildCompanyWizardPage />} />
        <Route
          path="/dashboard/*"
          element={
            <DashboardProvider>
              <PrivateRoute>
                <AccountProvider>
                  <DashboardPage />
                </AccountProvider>
              </PrivateRoute>
            </DashboardProvider>
          }>
          <Route index element={<DashboardHomePage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="buildCompany" element={<DashboardBuildCompanyPage />} />
          <Route path="taxes_and_accounting" element={<DashboardTaxesAndAccountingPage />} />
          <Route path="taxes_and_accounting/monthly_accounting" element={<MonthlyAccounting />} />
          <Route path="legal_services" element={<LegalServicesPage />} />
          <Route
            path="conceptualization"
            element={
              <ConceptualizationProvider>
                <ConceptualizationPage />
              </ConceptualizationProvider>
            }
          />
          <Route path="business_orientation" element={<BusinessOrientationPage />} />
          <Route path="graphic_design" element={<DashboardGraphicDesignPage />} />
          <Route
            path="graphic_design/logo_design"
            element={
              <ConceptualizationProvider>
                <LogoDesignPage />
              </ConceptualizationProvider>
            }
          />
          <Route path="legal_and_tax_compliance" element={<DashboardLegalAndTaxCompliancePage />} />
          <Route path="business_profile" element={<DashboardBusinessProfilePage />} />
        </Route>
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
