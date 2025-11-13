import { useState } from 'react';
import { AppContext } from './AppContext';
import Toast from '../../components/Toast/Toast';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';

export function AppProvider({ children }) {
  const initialState = {
    toast: {
      show: false,
      message: '',
      type: '',
      button: {},
    },
    isLoading: false,
    error: null,
  };
  const [state, setState] = useState(initialState);

  const setToast = (toast) => {
    setState((prevState) => {
      return {
        ...prevState,
        toast: { show: true, ...toast },
      };
    });
  };

  const setIsLoading = (isLoading) => {
    setState((prevState) => {
      return {
        ...prevState,
        isLoading,
      };
    });
  };

  const setError = (error) => {
    setState((prevState) => {
      return {
        ...prevState,
        error,
      };
    });
  };

  console.log('AppProvider state:', state);
  const { isLoading, error, toast } = state;

  return (
    <AppContext.Provider value={{ isLoading, error, toast, setIsLoading, setError, setToast }}>
      <Toast
        show={state.toast?.show}
        message={state.toast?.message}
        button={state.toast?.button}
        onClose={() => {
          setToast({
            show: false,
            message: '',
            type: '',
            button: {},
          });
        }}
        type={state.toast?.type}
      />
      {state.isLoading && <FullScreenSpinner />}
      {children}
    </AppContext.Provider>
  );
}
