import { useState } from 'react';
import { Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      const response = await axios.get('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('Response:', response);
      setResult(response.data);
    } catch (err) {
      console.error('API Error:', err);
      setError({
        message: err.response?.data?.message || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>API Test - Admin Stats</h5>
      </Card.Header>
      <Card.Body>
        <Button 
          onClick={testApi} 
          disabled={loading}
          variant="primary"
        >
          {loading ? 'Testing...' : 'Test API Call'}
        </Button>

        {error && (
          <Alert variant="danger" className="mt-3">
            <Alert.Heading>Error</Alert.Heading>
            <p><strong>Status:</strong> {error.status} {error.statusText}</p>
            <p><strong>Message:</strong> {error.message}</p>
          </Alert>
        )}

        {result && (
          <Alert variant="success" className="mt-3">
            <Alert.Heading>Success!</Alert.Heading>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ApiTest; 