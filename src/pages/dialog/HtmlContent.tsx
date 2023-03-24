import { FC } from 'react';
import styled from 'styled-components';
import xss from 'xss';

type Props = {
  body: string;
};

export const HtmlContent: FC<Props> = ({ body }) => {
  return <Body dangerouslySetInnerHTML={{ __html: xss(body) }} />;
};

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;
  flex-direction: column;
`;
