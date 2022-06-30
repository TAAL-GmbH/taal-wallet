import { FC } from 'react';

export const InfoIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M15,0C6.729,0,0,6.729,0,15s6.729,15,15,15s15-6.729,15-15S23.271,0,15,0z M14.5,5C16.43,5,18,6.57,18,8.5
			S16.43,12,14.5,12S11,10.43,11,8.5S12.57,5,14.5,5z M19,25h-7c-1.103,0-2-0.897-2-2c0-1.103,0.897-2,2-2h1v-4h-1
			c-1.103,0-2-0.897-2-2c0-1.103,0.897-2,2-2h5.5c0.276,0,0.5,0.224,0.5,0.5V21h1c1.103,0,2,0.897,2,2C21,24.103,20.103,25,19,25z"
    ></path>
  </svg>
);