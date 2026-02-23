import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CampaignProgress, calcWidths } from './campaign-progress';

describe('calcWidths', () => {
  it('returns all zeros when total is 0', () => {
    expect(calcWidths(0, 5, 3, 50)).toEqual({
      greenPct: 0,
      stripedPct: 0,
      blackPct: 0,
    });
  });

  it('returns all zeros when total is negative', () => {
    expect(calcWidths(-1, 5, 3, 50)).toEqual({
      greenPct: 0,
      stripedPct: 0,
      blackPct: 0,
    });
  });

  it('calculates correct percentages for a normal case', () => {
    // total=20, inProgress=8, completed=5, taskCompletion=50
    const result = calcWidths(20, 8, 5, 50);
    expect(result.greenPct).toBeCloseTo(65); // (8+5)/20 * 100
    expect(result.stripedPct).toBeCloseTo(45); // (5 + 8*0.5)/20 * 100
    expect(result.blackPct).toBeCloseTo(25); // 5/20 * 100
  });

  it('returns striped equal to black when taskCompletion is 0', () => {
    const result = calcWidths(10, 4, 3, 0);
    expect(result.stripedPct).toBe(result.blackPct);
  });

  it('returns striped equal to green when taskCompletion is 100', () => {
    const result = calcWidths(10, 4, 3, 100);
    expect(result.stripedPct).toBeCloseTo(result.greenPct);
  });

  it('returns black as 0 when completed is 0', () => {
    const result = calcWidths(10, 5, 0, 50);
    expect(result.blackPct).toBe(0);
  });

  it('returns green as 100 when all companies are accounted for', () => {
    const result = calcWidths(10, 3, 7, 50);
    expect(result.greenPct).toBe(100);
  });

  it('clamps when inProgress + completed exceeds total', () => {
    const result = calcWidths(10, 8, 8, 50);
    expect(result.greenPct).toBeLessThanOrEqual(100);
    expect(result.stripedPct).toBeLessThanOrEqual(100);
    expect(result.blackPct).toBeLessThanOrEqual(100);
  });

  it('clamps negative inProgress and completed to 0', () => {
    const result = calcWidths(10, -3, -2, 50);
    expect(result.greenPct).toBe(0);
    expect(result.stripedPct).toBe(0);
    expect(result.blackPct).toBe(0);
  });

  it('clamps taskCompletion to 0-100 range', () => {
    const over = calcWidths(10, 5, 3, 150);
    const capped = calcWidths(10, 5, 3, 100);
    expect(over.stripedPct).toBeCloseTo(capped.stripedPct);

    const under = calcWidths(10, 5, 3, -20);
    const floored = calcWidths(10, 5, 3, 0);
    expect(under.stripedPct).toBeCloseTo(floored.stripedPct);
  });
});

describe('CampaignProgress', () => {
  it('renders a progressbar role', () => {
    render(<CampaignProgress total={10} inProgress={3} completed={2} taskCompletion={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuemax to total and aria-valuenow to completed', () => {
    render(<CampaignProgress total={20} inProgress={5} completed={8} taskCompletion={40} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '20');
    expect(bar).toHaveAttribute('aria-valuenow', '8');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
  });

  it('renders no inner bars when total is 0', () => {
    const { container } = render(
      <CampaignProgress total={0} inProgress={0} completed={0} taskCompletion={0} />
    );
    const inner = container.querySelector('.relative');
    expect(inner?.children).toHaveLength(0);
  });

  it('renders all three bars when inProgress, completed, and taskCompletion are positive', () => {
    const { container } = render(
      <CampaignProgress total={20} inProgress={8} completed={5} taskCompletion={50} />
    );
    const inner = container.querySelector('.relative');
    expect(inner?.children).toHaveLength(3);
  });

  it('renders only the black bar when inProgress is 0 and completed > 0', () => {
    const { container } = render(
      <CampaignProgress total={10} inProgress={0} completed={5} taskCompletion={0} />
    );
    const inner = container.querySelector('.relative');
    // green bar (50%) + striped bar (50%, same as black) + black bar (50%)
    // All three render because stripedPct = blackPct = 50 > 0 and greenPct = 50 > 0
    const bars = inner?.children;
    expect(bars).toHaveLength(3);
    // The black bar should be the last one with bg-foreground
    const blackBar = bars![2] as HTMLElement;
    expect(blackBar).toHaveClass('bg-foreground');
    expect(blackBar.style.width).toBe('50%');
  });

  it('renders only green and striped bars when completed is 0 and taskCompletion > 0', () => {
    const { container } = render(
      <CampaignProgress total={10} inProgress={5} completed={0} taskCompletion={60} />
    );
    const inner = container.querySelector('.relative');
    // greenPct=50, stripedPct=30, blackPct=0 → 2 bars
    expect(inner?.children).toHaveLength(2);
  });

  it('renders only the green bar when completed is 0 and taskCompletion is 0', () => {
    const { container } = render(
      <CampaignProgress total={10} inProgress={5} completed={0} taskCompletion={0} />
    );
    const inner = container.querySelector('.relative');
    // greenPct=50, stripedPct=0, blackPct=0 → 1 bar
    expect(inner?.children).toHaveLength(1);
    const greenBar = inner?.children[0] as HTMLElement;
    expect(greenBar).toHaveClass('bg-accent-green');
  });

  it('sets correct widths on the bars', () => {
    const { container } = render(
      <CampaignProgress total={20} inProgress={8} completed={5} taskCompletion={50} />
    );
    const inner = container.querySelector('.relative');
    const bars = inner?.children;
    expect((bars![0] as HTMLElement).style.width).toBe('65%'); // green
    expect((bars![1] as HTMLElement).style.width).toBe('45%'); // striped
    expect((bars![2] as HTMLElement).style.width).toBe('25%'); // black
  });

  it('applies custom height to the outer container', () => {
    const { container } = render(
      <CampaignProgress total={10} inProgress={3} completed={2} taskCompletion={50} height={8} />
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.height).toBe('8px');
  });

  it('uses default height of 12px', () => {
    const { container } = render(
      <CampaignProgress total={10} inProgress={3} completed={2} taskCompletion={50} />
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.height).toBe('12px');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CampaignProgress total={10} inProgress={3} completed={2} taskCompletion={50} className="my-class" />
    );
    expect(container.firstElementChild).toHaveClass('my-class');
  });

  it('uses striped background-image on the middle bar', () => {
    const { container } = render(
      <CampaignProgress total={20} inProgress={8} completed={5} taskCompletion={50} />
    );
    const inner = container.querySelector('.relative');
    const stripedBar = inner?.children[1] as HTMLElement;
    expect(stripedBar.style.backgroundImage).toContain('repeating-linear-gradient');
  });
});
