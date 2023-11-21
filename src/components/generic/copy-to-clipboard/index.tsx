import { FC, ReactNode, useState } from 'react';
import styled, { css } from 'styled-components';
import toast from 'react-hot-toast';

import { CheckIcon } from '@/svg/check-icon';
import { CopyIcon } from '@/svg/copy-icon';
import { IconButton } from '@/generic/icon-button';
import { Tooltip } from '@/generic/tooltip';

type Props = {
  className?: string;
  textToCopy: string | number;
  showText?: boolean;
  showTooltip?: boolean;
  children?: ReactNode;
  size?: 'sm' | 'md';
};

let timer: ReturnType<typeof setTimeout>;

export const CopyToClipboard: FC<Props> = ({
  className,
  textToCopy,
  children,
  showTooltip = true,
  size = 'md',
}) => {
  const [wasCopied, setWasCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${textToCopy}`);
      toast.success('Copied to clipboard');
      setWasCopied(true);
      clearTimeout(timer);
      timer = setTimeout(() => setWasCopied(false), 1500);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  let contents: ReactNode;

  if (children) {
    contents = (
      <ChildrenWrapper className={showTooltip ? null : className} role="button" onClick={copyToClipboard}>
        {children}
      </ChildrenWrapper>
    );
  } else {
    contents = (
      <IconButtonStyled
        onClick={copyToClipboard}
        $wasCopied={wasCopied}
        className={showTooltip ? null : className}
        $size={size}
      >
        {wasCopied ? <CheckIcon /> : <CopyIcon />}
      </IconButtonStyled>
    );
  }

  return showTooltip ? (
    <TooltipStyled className={className} contents="Click to copy">
      {contents}
    </TooltipStyled>
  ) : (
    contents
  );
};

const ChildrenWrapper = styled.div`
  cursor: pointer;
`;

const IconButtonStyled = styled(IconButton)<{ $wasCopied: boolean; $size: Props['size'] }>`
  border-radius: 50%;
  width: 18px;
  height: 18px;
  padding: 0;
  display: inline-flex;

  ${({ $size }) =>
    $size === 'sm' &&
    css`
      width: 14px;
      height: 14px;
    `}

  ${({ $wasCopied }) =>
    $wasCopied &&
    css`
      background-color: ${({ theme }) => theme.color.success[400]};
      svg {
        color: #fff !important;
      }
    `}
`;

const TooltipStyled = styled(Tooltip)`
  cursor: pointer;
`;
