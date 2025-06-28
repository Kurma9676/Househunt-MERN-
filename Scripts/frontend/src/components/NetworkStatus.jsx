import { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineAlert) return null;

  return (
    <Alert 
      variant="warning" 
      dismissible 
      onClose={() => setShowOfflineAlert(false)}
      style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, minWidth: '300px' }}
    >
      <Alert.Heading>Connection Lost</Alert.Heading>
      <p>
        You appear to be offline. Some features may not work properly until your connection is restored.
      </p>
    </Alert>
  );
};

export default NetworkStatus; 