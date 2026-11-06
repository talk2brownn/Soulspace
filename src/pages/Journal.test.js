import { render, screen, fireEvent, within } from '@testing-library/react';
import Journal from './Journal';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    'journal-entries',
    JSON.stringify([
      { id: '1730800000000', title: 'Work stress', content: 'Deadline pressure', mood: { label: 'Anxious', emoji: '😰' } },
      { id: '1730700000000', title: 'Beach day', content: 'Sun and sea', mood: { label: 'Happy', emoji: '😊' } },
    ])
  );
});

test('search narrows the entry list', async () => {
  render(<Journal />);
  expect(await screen.findByText('Work stress')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/search entries/i), { target: { value: 'beach' } });
  expect(screen.queryByText('Work stress')).not.toBeInTheDocument();
  expect(screen.getByText('Beach day')).toBeInTheDocument();
});

test('an entry can be edited and the change is saved', async () => {
  render(<Journal />);
  fireEvent.click(await screen.findByText('Beach day'));
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByText(/edit/i));
  fireEvent.change(within(dialog).getByLabelText(/edit title/i), { target: { value: 'Best beach day' } });
  fireEvent.click(within(dialog).getByText(/save changes/i));
  expect(await within(dialog).findByText('Best beach day')).toBeInTheDocument();
  const stored = JSON.parse(localStorage.getItem('journal-entries'));
  expect(stored.find((e) => e.id === '1730700000000').title).toBe('Best beach day');
});
