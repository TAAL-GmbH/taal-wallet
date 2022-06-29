import { FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { routes } from '@/src/constants/routes';
import { useAppSelector } from '@/src/hooks';
import { AnchorLink } from '../anchorLink';
import { formatNumber, isNull } from '@/src/utils/generic';
import { IconButton } from '../generic/icon-button';
import { Chevron } from '../svg/chevron';
import { createToast } from '@/src/utils/toast';
import { getBalance } from '@/src/features/wocApiSlice';

type Props = {
  className?: string;
};

export const CurrentPk: FC<Props> = ({ className }) => {
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

  const toggleButton = (
    <ToggleButton onClick={() => setIsExpanded(val => !val)}>
      <Chevron direction={isExpanded ? 'up' : 'down'} />
    </ToggleButton>
  );

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

  const expandedContent = (
    <Dl>
      <dt>Name:</dt>
      <dd>
        {activePk?.name} (<AnchorLink href={routes.PK_LIST}>{activePk ? 'change' : 'select'}</AnchorLink>)
      </dd>

      <dt>Path:</dt>
      <dd>{activePk?.path}</dd>

      <dt>Address:</dt>
      <dd>{activePk?.address}</dd>

      <dt>Balance:</dt>
      <dd>
        {balance} (
        <AnchorLink href="#" onClick={_getBalance}>
          refresh
        </AnchorLink>
        )
      </dd>
    </Dl>
  );

  return (
    <Wrapper className={className} isExpanded={isExpanded}>
      {toggleButton}
      {isExpanded ? expandedContent : collapsedContent}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ isExpanded: boolean }>`
  font-size: 0.75rem;
  /* border-top: 1px solid ${({ theme }) => theme.color.grey[200]}; */
  /* border-bottom: 1px solid ${({ theme }) => theme.color.grey[200]}; */
  background-color: ${({ theme }) => theme.color.neutral[200]};
  padding: 0.5rem 1.5rem 0.3rem 0.6rem;
  border-radius: 0.5rem;
  position: relative;
`;

const ToggleButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  right: ${({ theme }) => theme.spacing.xs};

  svg {
    width: 1.1rem;
  }
`;

const Dl = styled.dl`
  display: grid;
  grid-template-columns: min-content auto;
  gap: 0.2rem 1rem;
  padding: 0 ${({ theme }) => theme.spacing.xs};
  margin: 0;

  dt {
    font-weight: bold;
    white-space: nowrap;
  }

  dd {
    margin: 0 0.5rem 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
