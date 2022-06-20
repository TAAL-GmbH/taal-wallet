import { injectSpacing } from '@/utils/injectSpacing';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  className?: string;
  'data-test-id'?: string;
  margin: string | boolean;
};

export const FormFieldWrapper: FC<Props> = ({
  className,
  children,
  'data-test-id': dataTestId,
  margin,
}) => {
  return (
    <Wrapper className={className} data-test-id={dataTestId} margin={margin}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<Props>`
  display: flex;
  flex-direction: column;
  user-select: none;
  /* padding: 0 0.4rem; */

  ${injectSpacing(['margin', 'padding'])}
`;
