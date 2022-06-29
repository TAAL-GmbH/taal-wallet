import { FC, useState } from 'react';
import toast from 'react-hot-toast';
import styled, { css } from 'styled-components';
import { CheckIcon } from '../../svg/checkIcon';
import { CopyIcon } from '../../svg/copyIcon';
import { IconButton } from '../icon-button';

type Props = {
  className?: string;
  text: string | number;
};

let timer: ReturnType<typeof setTimeout>;

export const CopyToClipboard: FC<Props> = ({ className, text }) => {
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

  return (
    <IconButtonStyled onClick={copyToClipboard} wasCopied={wasCopied} className={className}>
      {wasCopied ? <CheckIcon /> : <CopyIcon />}
    </IconButtonStyled>
  );
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
