import { useApp } from '../context/AppContext';
import { t } from './index';

/** Returns `t` bound to the current app language (supports `{var}` placeholders). */
export const useT = () => {
  const { state } = useApp();
  return (key: string, vars?: Record<string, string | number>) => t(state.lang, key, vars);
};
