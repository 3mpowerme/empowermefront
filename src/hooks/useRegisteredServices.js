import { useEffect, useState } from 'react';
import { privateService } from '../services/privateService';
import { useAccount } from './useAccount';

export function useRegisteredServies(page) {
  const [state, setState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeCompany: companyId } = useAccount();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (companyId) {
        const data = await privateService.get(
          `/company-registered-services/${companyId}?page=${page}`
        );
        setState(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  return { services: state, isLoading, error, refetch: fetchData };
}
