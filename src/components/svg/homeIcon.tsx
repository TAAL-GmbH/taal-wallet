import { FC } from 'react';

export const HomeIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path d="M12,3L20,9V21H15V14H9V21H4V9L12,3Z"></path>
  </svg>
);
