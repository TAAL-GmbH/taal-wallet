import { FC } from 'react';

export const BlankIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" className={className}>
    <g>
      <path
        d="M25.5,30h-21C4.2,30,4,29.8,4,29.5v-21c0-0.1,0.1-0.3,0.1-0.4l8-8C12.2,0.1,12.4,0,12.5,0h13C25.8,0,26,0.2,26,0.5v29
				C26,29.8,25.8,30,25.5,30z M5,29h20V1H12.7L5,8.7V29z"
      ></path>
    </g>
    <g>
      <path d="M12.5,9h-8C4.2,9,4,8.8,4,8.5S4.2,8,4.5,8H12V0.5C12,0.2,12.2,0,12.5,0S13,0.2,13,0.5v8C13,8.8,12.8,9,12.5,9z"></path>
    </g>
  </svg>
);
