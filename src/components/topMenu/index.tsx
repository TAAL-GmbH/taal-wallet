import { FC } from 'react';
import styled from 'styled-components';
import { routes } from '@/src/constants/routes';

type Props = {
  className?: string;
};

const menuItems: Record<string, string | (() => void)> = {
  Home: routes.HOME,
  'PK List': routes.PK_LIST,
  Options: () => chrome.runtime.openOptionsPage(),
};

export const TopMenu: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <ul>
        {Object.entries(menuItems).map(([label, val]) => {
          return (
            <li key={label}>
              {typeof val === 'string' && <a href={`#${val}`}>{label}</a>}
              {typeof val === 'function' && (
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    val();
                  }}
                >
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 0.2rem;
  background-color: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  text-align: left;
  min-width: 150px;

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  a {
    display: block;
    text-decoration: none;
    color: ${({ theme }) => theme.color.grey[700]};
    white-space: nowrap;
    padding: 0.5rem 1.5rem;
    font-size: 0.9rem;

    &:hover {
      color: ${({ theme }) => theme.color.grey[900]};
      background-color: ${({ theme }) => theme.color.grey[100]};
    }
  }
`;
