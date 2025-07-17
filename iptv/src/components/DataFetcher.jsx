import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

function DataFetcher() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('iptv_codes')
        .select('*');
      if (error) {
          setError(error.message);
        } else {
            console.log(data);
            setData(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Entries: {data.length}</h1>
    </div>
  );
}

export default DataFetcher; 