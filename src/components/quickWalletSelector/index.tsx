import { FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useAppSelector } from '@/src/hooks';
import { formatNumber, isNull } from '@/src/utils/generic';
import { createToast } from '@/src/utils/toast';
import { getBalance } from '@/src/features/wocApiSlice';
import { CurrentWallet } from './currentWallet';

type Props = {
  className?: string;
};

export const QuickWalletSelector: FC<Props> = ({ className }) => {
  const { activePk } = useAppSelector(state => state.pk);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (activePk?.address && typeof activePk?.balance?.amount !== 'number') {
      _getBalance();
    }
  }, [activePk?.balance?.amount]);

  const balance =
    typeof activePk?.balance?.amount === 'number'
      ? `${formatNumber(activePk?.balance?.amount)} satoshis`
      : 'unknown';

  const _getBalance = async () => {
    const toast = createToast('Fetching balance...');
    if (!activePk?.address) {
      toast.error('Please select an address');
      return;
    }
    const result = await getBalance([activePk.address]).catch(err => {
      toast.error(err);
      return null;
    });
    if (!isNull(result)) {
      toast.success('Balance fetched successfully');
    }
  };

  const collapsedContent = (
    <>
      <strong>{activePk?.name}: </strong>
      {balance}
    </>
  );

  return (
    <Wrapper
      className={className}
      isExpanded={isExpanded}
      role="button"
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {isExpanded ? <CurrentWallet onClose={() => setIsExpanded(false)} /> : collapsedContent}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ isExpanded: boolean }>`
  font-size: 0.75rem;
  background-color: ${({ theme }) => theme.color.neutral[200]};
  padding: 0.5rem 1.5rem 0.3rem 0.6rem;
  border-radius: 0.4rem;
  position: relative;

  ${({ isExpanded }) =>
    !isExpanded &&
    css`
      cursor: pointer;

      &:hover {
        background-color: ${({ theme }) => theme.color.neutral[400]};
      }
    `}
`;
