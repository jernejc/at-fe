import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EngagementIndicator } from './engagement-indicator';

describe('EngagementIndicator', () => {
  it('renders engaged / total text by default', () => {
    render(<EngagementIndicator engaged={4} total={12} />);
    expect(screen.getByText('4 / 12')).toBeInTheDocument();
  });

  it('hides count text when hideCount is true', () => {
    render(<EngagementIndicator engaged={4} total={12} hideCount />);
    expect(screen.queryByText('4 / 12')).not.toBeInTheDocument();
  });

  it('renders only the background arc when engaged is 0', () => {
    const { container } = render(
      <EngagementIndicator engaged={0} total={10} />
    );
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(1);
    expect(paths[0].getAttribute('stroke')).toBe('var(--border)');
  });

  it('renders both background and foreground arcs when engaged > 0', () => {
    const { container } = render(
      <EngagementIndicator engaged={5} total={10} />
    );
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(2);
    expect(paths[0].getAttribute('stroke')).toBe('var(--border)');
    expect(paths[1].getAttribute('stroke')).toBe('var(--foreground)');
  });

  it('sets strokeDashoffset to 0 when fully engaged', () => {
    const { container } = render(
      <EngagementIndicator engaged={10} total={10} />
    );
    const foreground = container.querySelectorAll('path')[1];
    expect(Number(foreground.getAttribute('stroke-dashoffset'))).toBeCloseTo(0);
  });

  it('sets correct strokeDashoffset for partial engagement', () => {
    const size = 24;
    const strokeWidth = size / 6;
    const radius = (size - strokeWidth) / 2;
    const arcLength = Math.PI * radius;

    const { container } = render(
      <EngagementIndicator engaged={5} total={10} />
    );
    const foreground = container.querySelectorAll('path')[1];
    const expected = arcLength * (1 - 0.5);
    expect(Number(foreground.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      expected
    );
  });

  it('clamps percentage to 1 when engaged exceeds total', () => {
    const { container } = render(
      <EngagementIndicator engaged={15} total={10} />
    );
    const foreground = container.querySelectorAll('path')[1];
    expect(Number(foreground.getAttribute('stroke-dashoffset'))).toBeCloseTo(0);
  });

  it('renders only background arc when total is 0', () => {
    const { container } = render(
      <EngagementIndicator engaged={0} total={0} />
    );
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(1);
  });

  it('applies custom size to the SVG', () => {
    const { container } = render(
      <EngagementIndicator engaged={3} total={10} size={48} />
    );
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('48');
  });

  it('uses rounded stroke linecaps', () => {
    const { container } = render(
      <EngagementIndicator engaged={5} total={10} />
    );
    const paths = container.querySelectorAll('path');
    for (const path of paths) {
      expect(path.getAttribute('stroke-linecap')).toBe('round');
    }
  });

  it('applies custom className', () => {
    const { container } = render(
      <EngagementIndicator engaged={1} total={5} className="extra" />
    );
    expect(container.firstElementChild).toHaveClass('extra');
  });
});
