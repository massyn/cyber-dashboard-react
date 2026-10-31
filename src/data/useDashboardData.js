import { useEffect, useState } from 'react';
import { loadData } from './loadData';

// Returns { data, error }; data is null until loading finishes.
export const useDashboardData = () => {
  const [state, setState] = useState({ data: null, error: null });

  useEffect(() => {
    let active = true;
    loadData()
      .then(data => { if (active) setState({ data, error: null }); })
      .catch(error => {
        console.error('Error loading dashboard data:', error);
        if (active) setState({ data: null, error });
      });
    return () => { active = false; };
  }, []);

  return state;
};
