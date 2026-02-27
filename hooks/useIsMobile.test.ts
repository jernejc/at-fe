import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIsMobile } from './useIsMobile';

function createMockMediaQueryList(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return {
    matches,
    addEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    }),
    removeEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    }),
    /** Simulate a media query change. */
    fire(newMatches: boolean) {
      listeners.forEach((cb) => cb({ matches: newMatches } as MediaQueryListEvent));
    },
  };
}

describe('useIsMobile', () => {
  let mql: ReturnType<typeof createMockMediaQueryList>;

  beforeEach(() => {
    mql = createMockMediaQueryList(false);
    vi.stubGlobal('matchMedia', vi.fn(() => mql));
  });

  it('returns false when viewport is above breakpoint', () => {
    mql.matches = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true when viewport is below breakpoint', () => {
    mql.matches = true;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    mql.matches = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => mql.fire(true));
    expect(result.current).toBe(true);

    act(() => mql.fire(false));
    expect(result.current).toBe(false);
  });

  it('uses custom breakpoint', () => {
    renderHook(() => useIsMobile(1024));
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1023px)');
  });

  it('removes listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledOnce();
  });
});
