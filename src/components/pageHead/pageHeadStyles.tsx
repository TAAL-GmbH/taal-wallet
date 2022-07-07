import styled from 'styled-components';

export const CtaWrapper = styled.div`
  position: relative;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

export const FloatingMenuBox = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 0;
  padding: 0.2rem 0;
  background-color: #fff;
  border-radius: 0.4rem;
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
  text-align: left;
  min-width: 200px;
  z-index: 1000;

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    min-width: 180px;
  }

  a,
  button {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    text-decoration: none;
    color: ${({ theme }) => theme.color.grey[700]};
    white-space: nowrap;
    padding: 0.8rem 2rem 0.8rem 1.5rem;
    font-size: 0.9rem;

    svg {
      width: 1.2rem;
      max-width: unset;
      height: 1.2rem;
      max-height: unset;
      margin: 0;
      fill: ${({ theme }) => theme.color.grey[600]};
    }

    &:hover {
      color: ${({ theme }) => theme.color.grey[900]};
      background-color: ${({ theme }) => theme.color.grey[100]};
    }
  }

  hr {
    background-color: transparent;
    border: 0;
    border-top: 1px solid ${({ theme }) => theme.color.neutral[200]};
  }
`;
