import { FC, useState } from 'react';
import { AccountIcon } from '../../svg/accountIcon';
import { CtaWrapper, Overlay } from '../pageHeadStyles';
import { AccountMenuContents } from './accountMenuContents';
import { IconButton } from '../../generic/icon-button';
import { useAppSelector } from '@/src/hooks';
import { NetworkPill } from '../../networkPill';
import styled from 'styled-components';

export const AccountMenu: FC = () => {
  const { accountMap, activeAccountId } = useAppSelector(state => state.account);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <CtaWrapper>
      {isExpanded && <Overlay onClick={() => setIsExpanded(false)} />}
      <IconButton onClick={() => setIsExpanded(!isExpanded)}>
        <AccountIcon />
        <NetworkPillStyled>{accountMap[activeAccountId]?.networkId}</NetworkPillStyled>
        {isExpanded && <AccountMenuContents />}
      </IconButton>
    </CtaWrapper>
  );
};

const NetworkPillStyled = styled(NetworkPill)`
  position: absolute;
  transform: scale(0.8);
  bottom: 0rem;
`;
