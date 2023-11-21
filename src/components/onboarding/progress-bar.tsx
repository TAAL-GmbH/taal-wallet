import { FC } from 'react';
import styled, { css } from 'styled-components';

import { gap, injectSpacing } from '@/utils/inject-spacing';
import { CheckIcon } from '@/components/svg/check-icon';
import { InjectSpacing } from '@/types';

type Props = {
  className?: string;
  progress: number;
  margin?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const ProgressBar: FC<Props> = ({ progress, margin, ...rest }) => {
  if (progress < 0 || progress > 100) {
    throw new Error('Invalid progress value');
  }

  const progress1 = progress >= 50 ? 100 : progress * 2;
  const progress2 = progress < 50 ? 0 : (progress - 50) * 2;
  const isComplete1 = progress > 50;
  const isComplete2 = progress == 100;

  return (
    <Wrapper {...rest} $margin={margin}>
      <Circle $isActive={progress >= 0} $isComplete={isComplete1}>
        {isComplete1 && <CheckIcon />}
      </Circle>
      <ProgressWrapper>
        <Bar style={{ width: `${progress1}%` }} />
      </ProgressWrapper>
      <Circle $isActive={progress >= 50} $isComplete={isComplete2}>
        {isComplete2 && <CheckIcon />}
      </Circle>
      <ProgressWrapper>
        <Bar style={{ width: `${progress2}%` }} />
      </ProgressWrapper>
      <Circle $isActive={progress === 100} $isComplete={false} />
    </Wrapper>
  );
};

const Wrapper = styled.div<InjectSpacing>`
  display: flex;
  align-items: center;
  ${gap`xs`};
  ${injectSpacing(['margin'])};
`;

const ProgressWrapper = styled.div`
  width: 80px;
  background-color: ${({ theme }) => theme.color.primary[200]};
`;

const Bar = styled.div`
  height: 2px;
  background-color: ${({ theme }) => theme.color.primary[600]};
`;

const Circle = styled.div<{ $isActive: boolean; $isComplete: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: relative;
  border: 2px solid ${({ theme, $isComplete }) => theme.color.primary[$isComplete ? 600 : 200]};

  ${({ $isComplete, theme }) => {
    return css`
      background-color: ${$isComplete ? theme.color.primary[600] : 'transparent'};
    `;
  }};

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    border-width: 5px;
    border-style: solid;

    ${({ $isActive, theme }) => {
      return css`
        border-color: ${theme.color.primary[$isActive ? 600 : 200]};
      `;
    }};
  }

  svg {
    fill: white;
    width: 12px;
    z-index: 100;
    position: absolute;
    left: 2px;
    top: 2px;
  }
`;
