import { render } from '@testing-library/react';

import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Example assertion: check if a known text or structure exists. 
  // We can just verify it renders without throwing errors for now.
});
