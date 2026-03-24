import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarkdownContent } from './markdown-content';

describe('MarkdownContent', () => {
  it('renders plain text unchanged', () => {
    render(<MarkdownContent content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders bold text as strong element', () => {
    render(<MarkdownContent content="This is **bold** text" />);
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  it('renders italic text as em element', () => {
    render(<MarkdownContent content="This is *italic* text" />);
    expect(screen.getByText('italic').tagName).toBe('EM');
  });

  it('renders unordered lists', () => {
    render(<MarkdownContent content={'- Item one\n- Item two'} />);
    expect(screen.getByText('Item one').closest('ul')).toBeInTheDocument();
  });

  it('renders links with target blank and rel noopener', () => {
    render(<MarkdownContent content="[Click here](https://example.com)" />);
    const link = screen.getByText('Click here');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders fallback em-dash when content is null', () => {
    render(<MarkdownContent content={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders fallback em-dash when content is undefined', () => {
    render(<MarkdownContent content={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders fallback em-dash when content is empty string', () => {
    render(<MarkdownContent content="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(<MarkdownContent content={null} fallback="N/A" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('passes className to wrapper div', () => {
    const { container } = render(<MarkdownContent content="Test" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
