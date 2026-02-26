import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompanyStatus } from './company-status';

const RADIUS = 7.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

describe('CompanyStatus', () => {
  // -- default state --
  it('renders a grey ring for default status', () => {
    const { container } = render(<CompanyStatus status="default" />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(1);
    expect(circles[0].getAttribute('stroke')).toBe('var(--gray-300)');
    expect(circles[0].getAttribute('fill')).toBe('none');
  });

  // -- new state --
  it('renders a yellow ring for new status', () => {
    const { container } = render(<CompanyStatus status="new" />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(1);
    expect(circles[0].getAttribute('stroke')).toBe('var(--accent-yellow)');
    expect(circles[0].getAttribute('fill')).toBe('none');
  });

  // -- in_progress state --
  it('renders background ring only when in_progress with 0% progress', () => {
    const { container } = render(
      <CompanyStatus status="in_progress" progress={0} />
    );
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(1);
    expect(circles[0].getAttribute('stroke')).toBe('var(--accent-green)');
  });

  it('renders both background and progress arcs when in_progress with progress > 0', () => {
    const { container } = render(
      <CompanyStatus status="in_progress" progress={50} />
    );
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    expect(circles[0].getAttribute('stroke')).toBe('var(--accent-green)');
    expect(circles[1].getAttribute('stroke')).toBe('var(--accent-green-dark)');
  });

  it('sets correct strokeDashoffset for 50% progress', () => {
    const { container } = render(
      <CompanyStatus status="in_progress" progress={50} />
    );
    const progressCircle = container.querySelectorAll('circle')[1];
    const expected = CIRCUMFERENCE * 0.5;
    expect(
      Number(progressCircle.getAttribute('stroke-dashoffset'))
    ).toBeCloseTo(expected);
  });

  it('sets strokeDashoffset to 0 at 100% progress', () => {
    const { container } = render(
      <CompanyStatus status="in_progress" progress={100} />
    );
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(
      Number(progressCircle.getAttribute('stroke-dashoffset'))
    ).toBeCloseTo(0);
  });

  it('clamps progress above 100 to 100', () => {
    const { container } = render(
      <CompanyStatus status="in_progress" progress={150} />
    );
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(
      Number(progressCircle.getAttribute('stroke-dashoffset'))
    ).toBeCloseTo(0);
  });

  it('clamps negative progress to 0', () => {
    const { container } = render(
      <CompanyStatus status="in_progress" progress={-20} />
    );
    const circles = container.querySelectorAll('circle');
    // negative clamps to 0, so no progress arc rendered
    expect(circles).toHaveLength(1);
  });

  it('uses rounded stroke linecaps on the progress arc', () => {
    const { container } = render(
      <CompanyStatus status="in_progress" progress={60} />
    );
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle.getAttribute('stroke-linecap')).toBe('round');
  });

  it('wraps in_progress circles in a rotated group', () => {
    const { container } = render(
      <CompanyStatus status="in_progress" progress={50} />
    );
    const g = container.querySelector('g');
    expect(g).not.toBeNull();
    expect(g!.getAttribute('transform')).toBe('rotate(-90 10 10)');
  });

  // -- closed_won state --
  it('renders a filled green circle with a checkmark for closed_won', () => {
    const { container } = render(<CompanyStatus status="closed_won" />);
    const circle = container.querySelector('circle')!;
    expect(circle.getAttribute('fill')).toBe('var(--accent-green-dark)');
    expect(circle.getAttribute('r')).toBe('10');

    const path = container.querySelector('path')!;
    expect(path.getAttribute('stroke')).toBe('white');
  });

  // -- closed_lost state --
  it('renders a filled dark-red circle with an X for closed_lost', () => {
    const { container } = render(<CompanyStatus status="closed_lost" />);
    const circle = container.querySelector('circle')!;
    expect(circle.getAttribute('fill')).toBe('var(--accent-dark-red)');
    expect(circle.getAttribute('r')).toBe('10');

    const path = container.querySelector('path')!;
    expect(path.getAttribute('stroke')).toBe('white');
  });

  // -- common props --
  it('applies custom size to the SVG', () => {
    const { container } = render(
      <CompanyStatus status="default" size={32} />
    );
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });

  it('defaults to 20px size', () => {
    const { container } = render(<CompanyStatus status="default" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('20');
    expect(svg.getAttribute('height')).toBe('20');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CompanyStatus status="default" className="extra" />
    );
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveClass('extra');
  });

  it('includes an aria-label with the status', () => {
    const { container } = render(<CompanyStatus status="in_progress" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-label')).toBe('Company status: in progress');
  });

  it('formats aria-label without underscores', () => {
    const { container } = render(<CompanyStatus status="closed_won" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-label')).toBe('Company status: closed won');
  });
});
