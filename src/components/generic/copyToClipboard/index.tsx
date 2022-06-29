import { FC, ReactNode, useState } from 'react';
import styled, { css } from 'styled-components';
import toast from 'react-hot-toast';
import { CheckIcon } from '../../svg/checkIcon';
import { CopyIcon } from '../../svg/copyIcon';
import { IconButton } from '../icon-button';
import { Tooltip } from '../tooltip';

type Props = {
  className?: string;
  text: string | number;
  showText?: boolean;
  showTooltip?: boolean;
};

let timer: ReturnType<typeof setTimeout>;

export const CopyToClipboard: FC<Props> = ({ className, text, showText, showTooltip = true }) => {
  const [wasCopied, setWasCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${text}`);
      toast.success('Copied to clipboard');
      setWasCopied(true);
      clearTimeout(timer);
      timer = setTimeout(() => setWasCopied(false), 1500);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  let contents: ReactNode;

  if (showText) {
    contents = (
      <span role="button" onClick={copyToClipboard}>
        {text}
      </span>
    );
  } else {
    contents = (
      <IconButtonStyled onClick={copyToClipboard} wasCopied={wasCopied} className={className}>
        {wasCopied ? <CheckIcon /> : <CopyIcon />}
      </IconButtonStyled>
    );
  }

  return <TooltipStyled contents={<>Click to copy</>}>{contents}</TooltipStyled>;
};

const IconButtonStyled = styled(IconButton)<{ wasCopied: boolean }>`
  border-radius: 50%;
  width: 1.6rem;
  height: 1.6rem;
  background-color: ${({ theme }) => theme.color.neutral[200]};

  svg {
    width: 75%;
    height: 75%;
  }

  ${({ wasCopied }) =>
    wasCopied &&
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
