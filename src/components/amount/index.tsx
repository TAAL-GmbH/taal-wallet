import { FC } from 'react';

type SatsOrBsv =
  | {
      sats: number | null | undefined;
      bsv?: never;
      minimumFractionDigits?: never;
    }
  | {
      sats?: never;
      bsv: number | null | undefined;
      minimumFractionDigits?: number;
    };

type Props = {
  className?: string;
  units?: 'sats' | 'bsv' | 'auto';
  showUnits?: boolean;
  fallback?: string | number;
} & React.HTMLAttributes<HTMLDivElement> &
  SatsOrBsv;

export const Amount: FC<Props> = ({
  sats: satsProp,
  bsv: bsvProp,
  minimumFractionDigits = 0,
  units: unitsProp = 'auto',
  showUnits = true,
  fallback = '---',
  className,
  ...rest
}) => {
  let sats: number;
  let bsv: number;
  let amount = '---';

  if (typeof satsProp === 'number') {
    sats = satsProp;
    bsv = satsProp / 1e8;
  } else if (typeof bsvProp === 'number') {
    bsv = bsvProp;
    sats = bsvProp * 1e8;
  } else {
    return fallback ? (
      <span className={className} {...rest}>
        {fallback}
      </span>
    ) : null;
  }

  const units = unitsProp !== 'auto' ? unitsProp : sats < 1000000 ? 'sats' : 'bsv';

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, {
      useGrouping: true,
      minimumFractionDigits,
      maximumFractionDigits: 8,
    });
  };

  if (units === 'bsv') {
    amount = `${formatNumber(bsv)}${showUnits && '\u00A0BSV'}`;
  } else {
    amount = `${formatNumber(sats)}${showUnits && '\u00A0sats'}`;
  }

  return (
    <span className={className} {...rest}>
      {amount}
    </span>
  );
};
