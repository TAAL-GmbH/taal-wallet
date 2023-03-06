import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { isBackgroundScript } from '../utils/generic';

const bc = new BroadcastChannel('redux_sync_channel');

export const useAppDispatch = () => {
  const dispatch = useDispatch<AppDispatch>();

  if (isBackgroundScript()) {
    return dispatch;
  } else {
    return (reduxAction: Parameters<typeof dispatch>[0]) => {
      bc.postMessage({
        action: 'bg:dispatch',
        reduxAction,
      });
    };
  }
};

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
