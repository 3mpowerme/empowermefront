import { useEffect, useState } from 'react';
import { genericService } from '../services/genericService';

export function useServicePlan(serviceCode) {
  const [state, setState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await genericService.getAll(`/plan/${serviceCode}`);
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

  return { plan: state, isLoading, error, refetch: fetchData };
}
