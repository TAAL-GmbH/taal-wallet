import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { pk } from '@/src/libs/PK';
import { Mnemonic } from 'bsv';
import { Button } from '@/src/components/button';
import toast from 'react-hot-toast';
import { AnchorLink } from '@/src/components/anchorLink';
import { routes } from '@/src/constants/routes';
import { navigateTo } from '@/src/utils/navigation';

type Props = {
  className?: string;
};

export const OnboardingImport: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <AnchorLink href={routes.ONBOARDING}>back</AnchorLink>
      <h1>Import your Wallet</h1>
      <p>Please input you secret phrase</p>
      <Textarea />
      <Button onClick={() => toast.error('Not implemented')}>Next</Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 60px;
`;
