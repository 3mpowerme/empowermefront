import { useEffect, useState } from 'react';
import { genericService } from '../services/genericService';
import { useAccount } from './useAccount';

export function useLogoHistory() {
  const [state, setState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeCompany: companyId } = useAccount();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await genericService.getAll(`/conceptualization/logo-history/${companyId}`);
      setState(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { logoHistory: state, isLoading, error, refetch: fetchData };
}
