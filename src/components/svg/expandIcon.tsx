import { FC } from 'react';

export const ExpandIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <polygon points="2,3.414 21.293,22.707 22.707,21.293 3.414,2 12,2 12,0 1,0 0,1 0,12 2,12 	"></polygon>
      <polygon points="12,64 12,62 3.414,62 22.707,42.707 21.293,41.293 2,60.586 2,52 0,52 0,63 1,64 	"></polygon>
      <polygon points="62,60.586 42.707,41.293 41.293,42.707 60.586,62 52,62 52,64 63,64 64,63 64,52 62,52 	"></polygon>
      <polygon points="52,0 52,2 60.586,2 41.293,21.293 42.707,22.707 62,3.414 62,12 64,12 64,1 63,0 	"></polygon>
    </g>
  </svg>
);
