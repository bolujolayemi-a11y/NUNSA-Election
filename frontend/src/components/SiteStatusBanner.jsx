import React, { useState, useEffect } from 'react';
import api from '../api/client';

export default function SiteStatusBanner() {
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get('/master/site-status')
      .then(({ data }) => setEnabled(data.site_enabled))
      .catch(() => setEnabled(true))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || enabled) return null;

  return (
    <div style={{
      background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#991b1b',
      padding: '10px 20px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 500,
    }}>
      🔴 Site is currently inactive.
    </div>
  );
}
