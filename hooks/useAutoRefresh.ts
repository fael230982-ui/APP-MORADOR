import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { emitAppRefresh, subscribeToAppRefresh, type RefreshEvent, type RefreshTopic } from '../utils/refreshBus';

type Options = {
  enabled?: boolean;
  intervalMs?: number;
  topics?: RefreshTopic[];
};

function shouldHandleEvent(event: RefreshEvent, topics?: RefreshTopic[]) {
  if (!topics?.length) return true;
  if (!event.topics?.length) return true;
  return event.topics.some((topic) => topics.includes(topic));
}

export function useAutoRefresh(refresh: (event?: RefreshEvent) => void | Promise<void>, options: Options = {}) {
  const { enabled = true, intervalMs, topics } = options;
  const runningRef = useRef(false);

  const runRefresh = useCallback(async (event?: RefreshEvent) => {
    if (!enabled || runningRef.current) return;

    try {
      runningRef.current = true;
      await refresh(event);
    } finally {
      runningRef.current = false;
    }
  }, [enabled, refresh]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;

      runRefresh({
        reason: 'manual',
        topics,
        source: 'focus',
        at: new Date().toISOString(),
      });

      const appStateSubscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          emitAppRefresh('foreground', { source: 'AppState' });
        }
      });

      const refreshUnsubscribe = subscribeToAppRefresh((event) => {
        if (!shouldHandleEvent(event, topics)) return;
        runRefresh(event);
      });

      const interval = intervalMs
        ? setInterval(() => {
            emitAppRefresh('interval', { topics, source: 'interval' });
          }, intervalMs)
        : undefined;

      return () => {
        appStateSubscription.remove();
        refreshUnsubscribe();
        if (interval) clearInterval(interval);
      };
    }, [enabled, intervalMs, runRefresh, topics])
  );
}
