import { InjectSpacing } from '@/types/index';
import { gap, injectSpacing } from '@/utils/inject-spacing';
import styled from 'styled-components';

export const Ul = styled.ul<InjectSpacing>`
  display: grid;
  grid-template-columns: 1fr;
  flex-direction: column;
  list-style: none;
  padding: 0;
  ${gap`sm`};
  ${injectSpacing(['margin'])};
`;
