import { useCallback, useEffect, useState } from 'react';
import { genericService } from '../services/genericService';

export function useFetch(url, options = {}) {
  const { autoFetch = true, initialState = [] } = options;

  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await genericService.getAll(url);
      setData(response);
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
