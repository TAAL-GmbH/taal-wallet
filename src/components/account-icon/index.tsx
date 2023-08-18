import { FC } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '@/hooks';

import iconMainnet1 from '@/assets/img/account-icons/mainnet-1.svg';
import iconMainnet2 from '@/assets/img/account-icons/mainnet-2.svg';
import iconMainnet3 from '@/assets/img/account-icons/mainnet-3.svg';
import iconMainnet4 from '@/assets/img/account-icons/mainnet-4.svg';
import iconMainnet5 from '@/assets/img/account-icons/mainnet-5.svg';
import iconTestnet1 from '@/assets/img/account-icons/testnet-1.svg';
import iconTestnet2 from '@/assets/img/account-icons/testnet-2.svg';
import iconTestnet3 from '@/assets/img/account-icons/testnet-3.svg';
import iconTestnet4 from '@/assets/img/account-icons/testnet-4.svg';
import iconTestnet5 from '@/assets/img/account-icons/testnet-5.svg';

const mainnetIconList = [iconMainnet1, iconMainnet2, iconMainnet3, iconMainnet4, iconMainnet5];
const testnetIconList = [iconTestnet1, iconTestnet2, iconTestnet3, iconTestnet4, iconTestnet5];

type Props = {
  className?: string;
  accountId: string;
};

export const AccountIcon: FC<Props> = ({ className, accountId }) => {
  const { accountMap } = useAppSelector(state => state.account);

  const account = accountMap[accountId];

  const testnetAccountList = Object.values(accountMap).filter(item => item.networkId === 'testnet');
  const mainnetAccountList = Object.values(accountMap).filter(item => item.networkId === 'mainnet');

  const accountList = account.networkId === 'testnet' ? testnetAccountList : mainnetAccountList;

  const accountIndex = accountList.findIndex(item => item.id === accountId);

  const iconList = account.networkId === 'testnet' ? testnetIconList : mainnetIconList;

  const accountIcon = iconList[accountIndex % iconList.length];

  const style = {};

  if (accountIndex >= 5 && accountIndex < 10) {
    style['filter'] = `saturate(0.5) hue-rotate(315deg)`;
    style['transform'] = `rotate(90deg)`;
  }
  if (accountIndex >= 10 && accountIndex < 15) {
    style['filter'] = `saturate(0.5) hue-rotate(270deg)`;
    style['transform'] = `rotate(180deg)`;
  }

  return <Icon className={className} src={accountIcon as string} alt="account" style={style} />;
};

const Icon = styled.img`
  width: 36px;
  height: 36px;
`;
