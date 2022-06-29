import styled from 'styled-components';

export const Ul = styled.ul`
  list-style: none;
  margin: 1rem 0;
  padding: 0;
  border-top: 1px double ${({ theme }) => theme.color.grey[200]};
  border-bottom: 1px double ${({ theme }) => theme.color.grey[200]};

  li + li {
    &::before {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: block;
      content: ' ';
      border-top: 1px solid #ccc;
    }
  }
`;

export const Li = styled.li`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  padding: 0 0.5rem 0.5rem;
  position: relative;
  background-color: ${({ theme }) => theme.color.grey[50]};

  &:hover {
    background-color: ${({ theme }) => theme.color.grey[100]};
    color: ${({ theme }) => theme.color.grey[700]};
  }
`;

export const Dl = styled.dl`
  display: grid;
  grid-template-columns: min-content auto;
  flex-direction: column;
  gap: 0.2rem 0.5rem;
  width: 100%;

  dt {
    font-weight: bold;
    white-space: nowrap;
  }

  dd {
    overflow-x: auto;
    overflow-y: hidden;
    margin: 0;
  }
`;
