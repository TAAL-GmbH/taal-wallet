import styled from 'styled-components';

import { InjectSpacing } from '@/types/index';
import { injectSpacing } from '@/utils/inject-spacing';

export const Dl = styled.dl<InjectSpacing>`
  display: grid;
  grid-template-columns: min-content auto;
  flex-direction: column;
  gap: 0.2rem 0.5rem;
  width: 100%;
  margin: 0.2rem 0;

  dt {
    font-weight: bold;
    white-space: nowrap;
  }

  dd {
    overflow-x: auto;
    overflow-y: hidden;
    margin: 0;
  }

  ${injectSpacing(['padding', 'margin'])}
`;

export const Center = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const VCenter = styled(Center)`
  justify-content: center;
`;

export const SpaceGrabber = styled.div`
  flex: auto;
`;
