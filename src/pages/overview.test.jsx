import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Overview from './overview';

const FILES = {
  '/library.csv': 'datestamp,metric_id,category,title,slo,slo_min,weight\n2024-01-01,A,Alpha,Metric A,0.9,0.8,1\n',
  '/summary.csv': 'datestamp,metric_id,business_unit,team,location,totalok,total\n'
    + '2024-01-01,A,IT,Cyber,Sydney,5,10\n2024-01-01,A,Sales,Field,Perth,10,10\n',
  '/detail.csv': 'datestamp,metric_id,business_unit,team,location,resource,compliance,detail\n',
};

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('fetch', vi.fn(async (path) => ({ ok: true, text: async () => FILES[path] })));
});
afterEach(() => vi.unstubAllGlobals());

const chooseBusinessUnit = async (user, name) => {
  await user.click(screen.getByRole('combobox', { name: 'Business Unit' }));
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name }));
};

test('selecting a business unit and then "All" keeps the overview rendered', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><Overview /></MemoryRouter>);

  expect(await screen.findByText('Organisational score over time')).toBeInTheDocument();

  await chooseBusinessUnit(user, 'Sales');
  expect(screen.getByText('Organisational score over time')).toBeInTheDocument();

  await chooseBusinessUnit(user, 'All');
  expect(screen.getByText('Organisational score over time')).toBeInTheDocument();
  expect(screen.getByText('Business Units')).toBeInTheDocument();
});
