import { isUndefined } from '@/src/utils/generic';
import { FC, InputHTMLAttributes, ReactNode } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = {
  columns?: number;
  gap?: string;
  children: ReactNode;
} & InputHTMLAttributes<HTMLDivElement>;

export const Grid: FC<Props> = props => {
  const theme = useTheme();
  const { children, columns = 12, gap = theme.grid.gap, ...rest } = props;

  const [columnGap, rowGap] = gap.split(' ');

  return (
    <Wrapper $columns={columns} $columnGap={columnGap} $rowGap={rowGap} {...rest}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  $columns?: Props['columns'];
  $columnGap: string;
  $rowGap: string | undefined;
}>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  ${({ $columnGap, $rowGap }) =>
    isUndefined($rowGap) ? `gap: ${$columnGap};` : `column-gap: ${$columnGap}; row-gap: ${$rowGap};`};
`;
