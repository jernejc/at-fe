import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useListKeyboardNav } from './useListKeyboardNav';

interface Item {
  id: number;
  name: string;
}

const items: Item[] = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
  { id: 3, name: 'Gamma' },
];

function fire(key: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('useListKeyboardNav', () => {
  const onSelect = vi.fn();
  const getKey = (item: Item) => item.id;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not attach listener when no item is selected', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    renderHook(() =>
      useListKeyboardNav({ items, selectedItem: null, getKey, onSelect }),
    );
    const keydownCalls = addSpy.mock.calls.filter(([event]) => event === 'keydown');
    expect(keydownCalls).toHaveLength(0);
    addSpy.mockRestore();
  });

  it('selects next item on ArrowDown', () => {
    renderHook(() =>
      useListKeyboardNav({ items, selectedItem: items[0], getKey, onSelect }),
    );

    act(() => fire('ArrowDown'));
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it('selects previous item on ArrowUp', () => {
    renderHook(() =>
      useListKeyboardNav({ items, selectedItem: items[2], getKey, onSelect }),
    );

    act(() => fire('ArrowUp'));
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it('does not go below the last item', () => {
    renderHook(() =>
      useListKeyboardNav({ items, selectedItem: items[2], getKey, onSelect }),
    );

    act(() => fire('ArrowDown'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not go above the first item', () => {
    renderHook(() =>
      useListKeyboardNav({ items, selectedItem: items[0], getKey, onSelect }),
    );

    act(() => fire('ArrowUp'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('ignores non-arrow keys', () => {
    renderHook(() =>
      useListKeyboardNav({ items, selectedItem: items[1], getKey, onSelect }),
    );

    act(() => fire('Enter'));
    act(() => fire('Tab'));
    act(() => fire('a'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    renderHook(() =>
      useListKeyboardNav({ items, selectedItem: items[0], getKey, onSelect, enabled: false }),
    );

    act(() => fire('ArrowDown'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('provides getItemRef that returns a callback ref', () => {
    const { result } = renderHook(() =>
      useListKeyboardNav({ items, selectedItem: null, getKey, onSelect }),
    );

    const refCb = result.current.getItemRef(1);
    expect(typeof refCb).toBe('function');
  });

  it('focuses the element when an item is selected via ref', () => {
    const el = document.createElement('div');
    el.focus = vi.fn();

    const { result, rerender } = renderHook(
      ({ selectedItem }: { selectedItem: Item | null }) =>
        useListKeyboardNav({ items, selectedItem, getKey, onSelect }),
      { initialProps: { selectedItem: null } },
    );

    // Register the ref
    act(() => result.current.getItemRef(2)(el));

    // Select the item
    rerender({ selectedItem: items[1] });
    expect(el.focus).toHaveBeenCalled();
  });

  it('removes listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useListKeyboardNav({ items, selectedItem: items[0], getKey, onSelect }),
    );

    unmount();
    const keydownCalls = removeSpy.mock.calls.filter(([event]) => event === 'keydown');
    expect(keydownCalls.length).toBeGreaterThan(0);
    removeSpy.mockRestore();
  });
});
