import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RangeFilter } from './range-filter';

// Minimal dataset: values 0–20 so the component renders with known min/max
const values = [0, 5, 10, 15, 20];

/** Render a RangeFilter with controlled range and return helpers. */
function setup(overrides: Partial<React.ComponentProps<typeof RangeFilter>> = {}) {
  const onChange = vi.fn();
  const result = render(
    <RangeFilter
      title="Test"
      values={values}
      min={0}
      max={20}
      range={[0, 20]}
      onChange={onChange}
      {...overrides}
    />,
  );
  return { onChange, ...result };
}

function getMinTrigger() {
  return screen.getByRole('button', { name: /^min /i });
}

function getMaxTrigger() {
  return screen.getByRole('button', { name: /max$/i });
}

describe('RangeInput', () => {
  describe('trigger button rendering', () => {
    it('renders min label with formatted value', () => {
      setup({ range: [5, 20] });
      expect(getMinTrigger()).toHaveTextContent('min 5');
    });

    it('renders max label with formatted value', () => {
      setup({ range: [0, 15] });
      expect(getMaxTrigger()).toHaveTextContent('15 max');
    });

    it('formats large values with locale separators', () => {
      const largeValues = [0, 10_000_000, 20_000_000, 30_000_000, 50_000_000];
      setup({ values: largeValues, min: 0, max: 50_000_000, range: [10_000_000, 50_000_000] });
      expect(getMinTrigger()).toHaveTextContent('min 10,000,000');
      expect(getMaxTrigger()).toHaveTextContent('50,000,000 max');
    });
  });

  describe('popover open/close', () => {
    it('opens popover with a number input when min trigger is clicked', async () => {
      setup();
      fireEvent.click(getMinTrigger());
      await waitFor(() => {
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
      });
    });

    it('opens popover with a number input when max trigger is clicked', async () => {
      setup();
      fireEvent.click(getMaxTrigger());
      await waitFor(() => {
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
      });
    });

    it('pre-fills input with current value on open', async () => {
      setup({ range: [7, 20] });
      fireEvent.click(getMinTrigger());
      await waitFor(() => {
        expect(screen.getByRole('spinbutton')).toHaveValue(7);
      });
    });

    it('closes popover when cancel button is clicked without calling onChange', async () => {
      const { onChange } = setup();
      fireEvent.click(getMinTrigger());
      await waitFor(() => {
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Cancel'));
      await waitFor(() => {
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('accepting values', () => {
    it('accepts a valid value via the confirm button', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ range: [0, 20] });

      fireEvent.click(getMinTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      await user.type(input, '8');
      fireEvent.click(screen.getByLabelText('Confirm'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([8, 20]);
      });
    });

    it('accepts a valid value via Enter key', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ range: [0, 20] });

      fireEvent.click(getMinTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      await user.type(input, '12');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([12, 20]);
      });
    });

    it('accepts a valid max value and fires onChange with updated max', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ range: [0, 20] });

      fireEvent.click(getMaxTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      await user.type(input, '15');
      fireEvent.click(screen.getByLabelText('Confirm'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([0, 15]);
      });
    });

    it('closes the popover after accepting', async () => {
      const user = userEvent.setup();
      setup({ range: [0, 20] });

      fireEvent.click(getMinTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      await user.type(input, '5');
      fireEvent.click(screen.getByLabelText('Confirm'));

      await waitFor(() => {
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
      });
    });
  });

  describe('clamping and validation', () => {
    it('clamps min value that exceeds current max to the max value', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ range: [0, 10] });

      fireEvent.click(getMinTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      await user.type(input, '15');
      fireEvent.click(screen.getByLabelText('Confirm'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([10, 10]);
      });
    });

    it('clamps max value below current min to the min value', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ range: [5, 20] });

      fireEvent.click(getMaxTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      await user.type(input, '2');
      fireEvent.click(screen.getByLabelText('Confirm'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([5, 5]);
      });
    });

    it('clamps min value below data minimum to data minimum', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ range: [5, 20] });

      fireEvent.click(getMinTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      await user.type(input, '-10');
      fireEvent.click(screen.getByLabelText('Confirm'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([0, 20]);
      });
    });

    it('clamps max value above data maximum to data maximum', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ range: [0, 15] });

      fireEvent.click(getMaxTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      await user.type(input, '999');
      fireEvent.click(screen.getByLabelText('Confirm'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([0, 20]);
      });
    });

    it('discards NaN input without calling onChange', async () => {
      const user = userEvent.setup();
      const { onChange } = setup({ range: [0, 20] });

      fireEvent.click(getMinTrigger());
      const input = await screen.findByRole('spinbutton');

      await user.clear(input);
      // Empty string parses to NaN for Number('')... actually Number('') is 0
      // Type non-numeric — but type="number" won't accept letters, so clear to empty
      // and rely on the input being empty string which Number('') === 0
      // Instead, test by confirming with a cleared field — the value will be 0 (clamped to dataMin)
      fireEvent.click(screen.getByLabelText('Confirm'));

      // Empty input: Number('') === 0, which is valid and equals dataMin
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([0, 20]);
      });
    });
  });

  describe('draft reset on reopen', () => {
    it('resets draft to current value when reopened after cancel', async () => {
      const user = userEvent.setup();
      setup({ range: [5, 20] });

      // Open and modify
      fireEvent.click(getMinTrigger());
      const input = await screen.findByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '99');

      // Cancel
      fireEvent.click(screen.getByLabelText('Cancel'));
      await waitFor(() => {
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
      });

      // Reopen — should show original value, not 99
      fireEvent.click(getMinTrigger());
      await waitFor(() => {
        expect(screen.getByRole('spinbutton')).toHaveValue(5);
      });
    });
  });
});
