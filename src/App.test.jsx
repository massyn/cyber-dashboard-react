import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page heading', () => {
  render(<App />);
  expect(screen.getByText(/Welcome to Cyber Metrics/i)).toBeInTheDocument();
});
