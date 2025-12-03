import { useEffect, useState } from 'react';
import { privateService } from '../services/privateService';

export function useCompanySetup(companyId) {
  const [state, setState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await privateService.get(`/account/${companyId}`);
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

  return { account: state, isLoading, error, refetch: fetchData };
}
