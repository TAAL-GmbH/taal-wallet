import { FC } from 'react';
import styled from 'styled-components';
import { routes } from '@/src/constants/routes';
import { useAppSelector } from '@/src/hooks';
import { AnchorLink } from '../anchorLink';

type Props = {
  className?: string;
};

export const CurrentPk: FC<Props> = ({ className }) => {
  const { current } = useAppSelector(state => state.pk);

  return (
    <Wrapper className={className}>
      <strong>Active PK:</strong> {current?.address?.slice(0, 18)}... (
      <AnchorLink href={routes.PK_LIST}>
        {current ? 'change' : 'select'}
      </AnchorLink>
      )
    </Wrapper>
  );
};

const Wrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color.grey[200]};
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[200]};
  background-color: ${({ theme }) => theme.color.grey[50]};
  padding: ${({ theme }) => theme.spacing.sm};
`;
