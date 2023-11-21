import { FC } from 'react';
import styled from 'styled-components';

import { margin, padding } from '@/utils/inject-spacing';

type Props = {
  attributeList: {
    key: string;
    value: string;
  }[];
};

export const AttributesPreview: FC<Props> = ({ attributeList }) => {
  if (!attributeList.length) {
    return null;
  }

  return (
    <>
      <Title>ATTRIBUTES</Title>

      <Ul>
        {attributeList.map(attribute => (
          <li key={attribute.key}>
            <AttrKey>{attribute.key}:</AttrKey>
            {attribute.value}
          </li>
        ))}
      </Ul>
    </>
  );
};

const Title = styled.h3`
  ${({ theme }) => theme.typography.heading7};
  ${margin`lg 0 sm xs`};
`;

const Ul = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  grid-gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    ${padding`sm md`};
    background-color: ${({ theme }) => theme.color.primary[500]};
    color: ${({ theme }) => theme.color.primary[50]};
    border-radius: 8px;
    text-align: center;
  }
`;

const AttrKey = styled.div`
  font-weight: bold;
`;
