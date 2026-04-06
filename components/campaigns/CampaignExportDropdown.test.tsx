import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampaignExportDropdown } from './CampaignExportDropdown';

const mockHandleExport = vi.fn();
const mockHandleExportContacts = vi.fn();
const mockUseCampaignExport = vi.fn();

vi.mock('@/hooks/useCampaignExport', () => ({
  useCampaignExport: (opts: any) => mockUseCampaignExport(opts),
}));

const defaultHookValues = {
  isExporting: false,
  isExportingContacts: false,
  handleExport: mockHandleExport,
  handleExportContacts: mockHandleExportContacts,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCampaignExport.mockReturnValue(defaultHookValues);
});

describe('CampaignExportDropdown', () => {
  it('renders an Export trigger button', () => {
    render(<CampaignExportDropdown slug="test-campaign" />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('passes slug to useCampaignExport', () => {
    render(<CampaignExportDropdown slug="my-slug" />);
    expect(mockUseCampaignExport).toHaveBeenCalledWith({ slug: 'my-slug' });
  });

  it('opens the dropdown and shows format options on click', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown slug="test" />);

    await user.click(screen.getByText('Export'));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByText('CSV (.csv)')).toBeInTheDocument();
    expect(screen.getByText('Google Sheets')).toBeInTheDocument();
  });

  it('shows only Export Companies button by default', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown slug="test" />);

    await user.click(screen.getByText('Export'));
    await screen.findByRole('menu');

    expect(screen.getByRole('button', { name: /Export Companies/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Export Contacts/i })).not.toBeInTheDocument();
  });

  it('shows both action buttons when actions includes contacts', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown slug="test" actions={['companies', 'contacts']} />);

    await user.click(screen.getByText('Export'));
    await screen.findByRole('menu');

    expect(screen.getByRole('button', { name: /Export Companies/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export Contacts/i })).toBeInTheDocument();
  });

  it('calls handleExport with default xlsx format', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown slug="test" />);

    await user.click(screen.getByText('Export'));
    await screen.findByRole('menu');
    fireEvent.click(screen.getByRole('button', { name: /Export Companies/i }));

    expect(mockHandleExport).toHaveBeenCalledOnce();
    expect(mockHandleExport).toHaveBeenCalledWith('xlsx');
  });

  it('calls handleExportContacts with default xlsx format', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown slug="test" actions={['companies', 'contacts']} />);

    await user.click(screen.getByText('Export'));
    await screen.findByRole('menu');
    fireEvent.click(screen.getByRole('button', { name: /Export Contacts/i }));

    expect(mockHandleExportContacts).toHaveBeenCalledOnce();
    expect(mockHandleExportContacts).toHaveBeenCalledWith('xlsx');
  });

  it('switches format to csv and exports with it', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown slug="test" />);

    await user.click(screen.getByText('Export'));
    await screen.findByRole('menu');

    fireEvent.click(screen.getByText('CSV (.csv)'));
    fireEvent.click(screen.getByRole('button', { name: /Export Companies/i }));

    expect(mockHandleExport).toHaveBeenCalledWith('csv');
  });

  it('switches format to gsheet and exports with it', async () => {
    const user = userEvent.setup();
    render(<CampaignExportDropdown slug="test" />);

    await user.click(screen.getByText('Export'));
    await screen.findByRole('menu');

    fireEvent.click(screen.getByText('Google Sheets'));
    fireEvent.click(screen.getByRole('button', { name: /Export Companies/i }));

    expect(mockHandleExport).toHaveBeenCalledWith('gsheet');
  });

  it('disables the trigger button while exporting', () => {
    mockUseCampaignExport.mockReturnValue({ ...defaultHookValues, isExporting: true });
    render(<CampaignExportDropdown slug="test" />);

    const trigger = screen.getByText('Export').closest('button')!;
    expect(trigger).toBeDisabled();
  });

  it('disables the trigger button while exporting contacts', () => {
    mockUseCampaignExport.mockReturnValue({ ...defaultHookValues, isExportingContacts: true });
    render(<CampaignExportDropdown slug="test" actions={['companies', 'contacts']} />);

    const trigger = screen.getByText('Export').closest('button')!;
    expect(trigger).toBeDisabled();
  });

  it('disables the Export Companies button while exporting', async () => {
    mockUseCampaignExport.mockReturnValue({ ...defaultHookValues, isExporting: true });
    const user = userEvent.setup();
    render(<CampaignExportDropdown slug="test" />);

    // Trigger is disabled, so force-open won't work — re-render with not-yet-exporting to open
    mockUseCampaignExport.mockReturnValue(defaultHookValues);
    const { rerender } = render(<CampaignExportDropdown slug="test" />);

    await user.click(screen.getAllByText('Export')[1].closest('button')!);
    await screen.findByRole('menu');

    // Now simulate exporting state
    mockUseCampaignExport.mockReturnValue({ ...defaultHookValues, isExporting: true });
    rerender(<CampaignExportDropdown slug="test" />);

    expect(screen.getByRole('button', { name: /Export Companies/i })).toBeDisabled();
  });
});
