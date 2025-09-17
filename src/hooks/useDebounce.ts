import { useCallback } from 'react';
import debounce from 'lodash.debounce';

export const useDebounce = (callback: () => void, delay: number) => {
    const debouncedCallback = useCallback(
        debounce(callback, delay),
        [callback, delay]
    );

    return debouncedCallback;
};
