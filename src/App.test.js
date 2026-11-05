import { render, screen } from '@testing-library/react';
import App from './App';

// With no Supabase keys set, the app runs in device-only mode and opens
// straight onto the mood check-in.
test('renders the mood check-in and the always-visible help link', async () => {
  render(<App />);
  expect(await screen.findByText(/how are you feeling today/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /get help/i })).toBeInTheDocument();
});
