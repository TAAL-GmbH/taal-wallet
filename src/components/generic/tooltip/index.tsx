import React, { cloneElement, FC, ReactNode } from 'react';
import ReactTooltip from 'react-tooltip';

type Props = {
  children: ReactNode;
  contents?: string | ReactNode;
};

export const Tooltip: FC<Props> = ({ children, contents }) => {
  return (
    React.isValidElement(children) && (
      <>
        <ReactTooltip place="top" effect="solid">
          {contents}
        </ReactTooltip>
        {cloneElement(children, {
          'data-tip': true,
        })}
      </>
    )
  );
};
