import { FC } from 'react';

type Props = {
  className?: string;
};

export const AbstractIcon01: FC<Props> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="mask0_628_1262" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <circle cx="12" cy="12" r="12" fill="url(#paint0_radial_628_1262)" />
      </mask>
      <g mask="url(#mask0_628_1262)">
        <circle cx="12" cy="12" r="12" fill="#232D7C" />
        <circle cx="12.2" cy="3.4" r="11.4" fill="#F5A200" />
        <circle cx="3.20005" cy="22" r="8.4" fill="#0084E3" />
        <circle cx="22.4" cy="22.4" r="8.4" fill="#6EC492" />
        <circle cx="17.2" cy="7.2" r="3.2" fill="#5B4DFF" />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_628_1262"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12 12) rotate(90) scale(17.8)"
        >
          <stop stopColor="#FCD17A" />
          <stop offset="1" stopColor="#FFBD3E" />
        </radialGradient>
      </defs>
    </svg>
  );
};
