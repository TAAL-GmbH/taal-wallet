import { FC, ReactElement, isValidElement, useId } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

type Props = {
  children: ReactElement;
  contents: string;
  className?: string;
};

export const Tooltip: FC<Props> = ({ children, contents, className }) => {
  const uid = `tooltip-${useId()}`;

  return (
    isValidElement(children) && (
      <>
        <ReactTooltip id={uid} content={contents} />
        <span className={className} data-tooltip-id={uid}>
          {children}
        </span>
      </>
    )
  );
};
