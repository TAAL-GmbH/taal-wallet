import { FC, useState } from 'react';
import { AccountIcon } from '../../svg/accountIcon';
import { CtaWrapper, Overlay } from '../pageHeadStyles';
import { AccountMenuContents } from './accountMenuContents';
import { IconButton } from '../../generic/icon-button';

export const AccountMenu: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <CtaWrapper>
      {isExpanded && <Overlay onClick={() => setIsExpanded(false)} />}
      <IconButton onClick={() => setIsExpanded(!isExpanded)}>
        <AccountIcon />
        {isExpanded && <AccountMenuContents />}
      </IconButton>
    </CtaWrapper>
  );
};
