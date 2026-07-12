import { useState, useMemo } from 'react';

export function useSort(data, defaultKey = null, defaultDirection = 'asc') {
  const [sortConfig, setSortConfig] = useState({ key: defaultKey, direction: defaultDirection });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !Array.isArray(data)) return data;
    return [...data].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB, undefined, { numeric: true });
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    });
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedData, requestSort, sortConfig };
