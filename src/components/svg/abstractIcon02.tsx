import { FC } from 'react';

type Props = {
  className?: string;
};

export const AbstractIcon02: FC<Props> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="mask0_628_1266" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <circle cx="12" cy="12" r="12" fill="url(#paint0_radial_628_1266)" />
      </mask>
      <g mask="url(#mask0_628_1266)">
        <circle cx="12" cy="12" r="12" fill="#232D7C" />
        <circle cx="22" cy="19" r="12" fill="#A86EC4" />
        <circle cx="12.2" cy="3.4" r="11.4" fill="#00F5BB" />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_628_1266"
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
