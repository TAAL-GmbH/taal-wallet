import { FC } from 'react';
import styled, { useTheme } from 'styled-components';

import { TaalLogo } from '@/components/svg/taal-logo';
import { margin, padding } from '@/utils/inject-spacing';
import { Box } from '@/components/generic/box';
import { EyeIcon } from '@/components/svg/eye-icon';
import { ArrowLeftRightIcon } from '@/components/svg/arrow-left-right-icon';
import { CloseIcon } from '@/components/svg/close-icon';
import { Note } from '@/components/generic/note';

type Props = {
  data: {
    origin: string;
  };
};

export const ConfirmOrigin: FC<Props> = ({ data }) => {
  const theme = useTheme();

  if (!data.origin) {
    return <Note variant="danger">Origin not specified!</Note>;
  }

  return (
    <div>
      <TopWrapper>
        <LogoWrapper>
          <TaalLogo />
        </LogoWrapper>
        <Origin>{data.origin}</Origin>
        <h1>Connect this site to your wallet?</h1>
      </TopWrapper>
      <Box>
        <AllowDenyList>
          <li>
            <Title>
              <IconWrapper $color={theme.color.success[600]}>
                <EyeIcon />
              </IconWrapper>
              Allow
            </Title>
            Viewing wallet balance, activity and public key
          </li>

          <li>
            <Title>
              <IconWrapper $color={theme.color.success[600]}>
                <ArrowLeftRightIcon />
              </IconWrapper>
              Allow
            </Title>
            Sending requests for transactions
          </li>

          <li>
            <Title>
              <IconWrapper $color={theme.color.danger[400]}>
                <CloseIcon />
              </IconWrapper>
              Don’t Allow
            </Title>
            Sending funds without your request
          </li>
        </AllowDenyList>
      </Box>
    </div>
  );
};

const TopWrapper = styled.div`
  text-align: center;
  ${padding`lg md`}
`;

const LogoWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #ffc700;
  border-radius: 50%;

  svg {
    width: 80%;
    fill: #282933;
  }
`;

const Origin = styled.div`
  font-size: 14px;
  color: #a3a3a3;
  ${margin`lg`}
`;

const AllowDenyList = styled.ul`
  ${({ theme }) => theme.typography.body3};
  color: ${({ theme }) => theme.color.grey[600]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  list-style: none;
  padding: 0;

  li {
    position: relative;
    ${padding`xs 0 xs 32px`};
  }
`;

const Title = styled.div`
  ${({ theme }) => theme.typography.heading5};
  color: ${({ theme }) => theme.color.grey[800]};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const IconWrapper = styled.div<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;

  svg {
    height: 24px;
    width: 24px;
    fill: ${({ $color }) => $color};
  }
`;
