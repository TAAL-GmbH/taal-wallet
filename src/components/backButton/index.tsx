import { FC } from 'react';
import { useHashLocation } from '@/src/hooks/useHashLocation';
import { AnchorLink } from '../anchorLink';
import styled from 'styled-components';

type Props = {
  className?: string;
};

export const BackButton: FC<Props> = ({ className }) => {
  const [location] = useHashLocation();

  if (location === '/') {
    return null;
  }

  return (
    <Wrapper>
      <AnchorLink className={className} href="#" onClick={() => history.back()}>
        Back
      </AnchorLink>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 1rem 0;
`;
