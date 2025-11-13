import { useEffect, useState } from 'react';
import { ShareholderContext } from './ShareholderContext';
import { privateService } from '../../services/privateService';
import { useApp } from '../../hooks/useApp';
import { storage } from '../../utils/storage';
import { useAccount } from '../../hooks/useAccount';

export function ShareholderProvider({ children }) {
  const initialState = {
    shareholders: [],
  };
  const [state, setState] = useState(initialState);
  const { setIsLoading } = useApp();
  const { activeCompany: companyId } = useAccount();

  const setShareholders = (newState = {}) => {
    setState((prevState) => {
      return {
        ...prevState,
        shareholders: [...newState],
      };
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await privateService.get(`/company-shareholder/${companyId}`);
      setShareholders(data);
    } catch (err) {
      console.error('Error loading company-shareholder', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log('ShareholderProvider state:', state);
  const { shareholders } = state;
  const hasShareholders = shareholders.length > 0;
  storage.setItem('hasShareholders', hasShareholders);
  console.log('ShareholderProvider hasShareholders ', hasShareholders);
  return (
    <ShareholderContext.Provider
      value={{
        hasShareholders,
        shareholders,
        setShareholders,
        refetch: fetchData,
      }}>
      {children}
    </ShareholderContext.Provider>
  );
}
