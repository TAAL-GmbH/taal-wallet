import { Button } from '@/src/components/button';
import { ImportIcon } from '@/src/components/svg/importIcon';
import { WalletPlusIcon } from '@/src/components/svg/walletPlusIcon';
import { routes } from '@/src/constants/routes';
import { navigateTo } from '@/src/utils/navigation';
import { FC } from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
};

export const Onboarding: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <h1>
        <small>Welcome to</small>
        <br />
        TAAL Wallet
      </h1>
      <p>Looks like it's your first run on this device.</p>

      <Option>
        <WalletPlusIcon />
        <Short>I want to create a new wallet</Short>
        <Button onClick={() => navigateTo(routes.ONBOARDING_NEW)} variant="success">
          Create a wallet
        </Button>
      </Option>

      <Option>
        <ImportIcon />
        <Short>I have a secret recovery phrase</Short>
        <Button onClick={() => navigateTo(routes.ONBOARDING_IMPORT)}>Import wallet</Button>
      </Option>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  text-align: center;
`;

const Option = styled.div`
  border: 1px solid ${({ theme }) => theme.color.grey[50]};
  border-radius: 0.4rem;
  padding: ${({ theme }) => theme.spacing.sm};
  margin-top: 1rem;
  text-align: center;

  svg {
    margin-top: 0.4rem;
    width: 30px;
    height: 30px;
    fill: ${({ theme }) => theme.color.grey[400]};
  }

  button {
    width: 100%;
  }
`;

const Short = styled.div`
  margin: 0.2rem 0 1rem 0;
  color: ${({ theme }) => theme.color.grey[200]};
`;
