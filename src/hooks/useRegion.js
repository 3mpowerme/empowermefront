import { useEffect, useState } from 'react';
import { genericService } from '../services/genericService';

export function useRegion() {
  const [state, setState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await genericService.getAll('/region');
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

  return { region: state, isLoading, error, refetch: fetchData };
}
