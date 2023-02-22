import { FC, Fragment } from 'react';
import styled from 'styled-components';

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
      <h4>ATTRIBUTES PREVIEW</h4>

      <Dl>
        {attributeList.map(attribute => (
          <Fragment key={attribute.key}>
            <dt>{attribute.key}:</dt>
            <dd>{attribute.value}</dd>
          </Fragment>
        ))}
      </Dl>
    </>
  );
};

const Dl = styled.dl`
  display: grid;
  grid-template-columns: 30% auto;
  border-top: 1px solid ${({ theme }) => theme.color.grey[300]};
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[300]};
  line-height: 1.5;

  dt {
    font-weight: bold;
    text-align: right;
  }

  dd {
    margin: 0;
    padding-left: 10px;
  }

  dt,
  dd {
    border-bottom: 1px solid ${({ theme }) => theme.color.grey[100]};
  }
`;
