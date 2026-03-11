import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FitScoreIndicator } from './fit-score-indicator';

vi.mock('./trend-indicator', () => ({
  TrendIndicator: ({ change }: { change: number }) => (
    <span data-testid="trend-indicator">{change}</span>
  ),
}));

describe('FitScoreIndicator', () => {
  it('renders the numeric score by default', () => {
    render(<FitScoreIndicator score={72} />);
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('hides the numeric score when showValue is false', () => {
    render(<FitScoreIndicator score={72} showValue={false} />);
    expect(screen.queryByText('72')).not.toBeInTheDocument();
  });

  it('shows TrendIndicator when change is provided and non-zero', () => {
    render(<FitScoreIndicator score={50} change={3} />);
    expect(screen.getByTestId('trend-indicator')).toHaveTextContent('3');
  });

  it('hides TrendIndicator when showChange is false', () => {
    render(<FitScoreIndicator score={50} change={3} showChange={false} />);
    expect(screen.queryByTestId('trend-indicator')).not.toBeInTheDocument();
  });

  it('hides TrendIndicator when change is zero', () => {
    render(<FitScoreIndicator score={50} change={0} />);
    expect(screen.queryByTestId('trend-indicator')).not.toBeInTheDocument();
  });

  it('hides TrendIndicator when change is undefined', () => {
    render(<FitScoreIndicator score={50} />);
    expect(screen.queryByTestId('trend-indicator')).not.toBeInTheDocument();
  });

  it('sets foreground opacity to 0.2 for scores at or below 50', () => {
    const { container } = render(<FitScoreIndicator score={30} />);
    const layers = container.querySelectorAll('.absolute.rounded-full');
    const foreground = layers[1] as HTMLElement;
    expect(foreground.style.opacity).toBe('0.2');
  });

  it('sets foreground opacity to 1 for scores at or above 90', () => {
    const { container } = render(<FitScoreIndicator score={95} />);
    const layers = container.querySelectorAll('.absolute.rounded-full');
    const foreground = layers[1] as HTMLElement;
    expect(foreground.style.opacity).toBe('1');
  });

  it('interpolates foreground opacity between scores 50 and 90', () => {
    const { container } = render(<FitScoreIndicator score={70} />);
    const layers = container.querySelectorAll('.absolute.rounded-full');
    const foreground = layers[1] as HTMLElement;
    // score 70 → 0.2 + ((70-50)/40) * 0.8 = 0.2 + 0.4 = 0.6
    expect(Number(foreground.style.opacity)).toBeCloseTo(0.6);
  });

  it('renders only the background layer when score is 0', () => {
    const { container } = render(<FitScoreIndicator score={0} />);
    const layers = container.querySelectorAll('.absolute.rounded-full');
    expect(layers).toHaveLength(1);
    expect((layers[0] as HTMLElement).style.background).toBe('var(--border)');
  });

  it('renders foreground with conic-gradient when score is above 0', () => {
    const { container } = render(<FitScoreIndicator score={50} />);
    const layers = container.querySelectorAll('.absolute.rounded-full');
    expect(layers).toHaveLength(2);
    expect((layers[1] as HTMLElement).style.background).toContain('conic-gradient');
  });

  it('applies custom size to the disc', () => {
    const { container } = render(<FitScoreIndicator score={50} size={32} />);
    const disc = container.querySelector('.relative.rounded-full') as HTMLElement;
    expect(disc.style.width).toBe('32px');
    expect(disc.style.height).toBe('32px');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FitScoreIndicator score={50} className="my-class" />
    );
    expect(container.firstElementChild).toHaveClass('my-class');
  });
});
