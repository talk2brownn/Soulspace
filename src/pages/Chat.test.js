import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Chat from './Chat';

test('a crisis message gets helpline information straight away', async () => {
  render(
    <MemoryRouter>
      <Chat />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByLabelText(/message the companion/i), {
    target: { value: "I don't want to live anymore" },
  });
  fireEvent.click(screen.getByRole('button', { name: /send/i }));
  expect(await screen.findByText(/you deserve support from a real person/i)).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /call/i }).length).toBeGreaterThan(0);
});
