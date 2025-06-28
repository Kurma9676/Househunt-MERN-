import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...', size = 'border' }) => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <Spinner animation={size} variant="primary" role="status">
          <span className="visually-hidden">{message}</span>
        </Spinner>
        <div className="mt-2 text-muted">{message}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 