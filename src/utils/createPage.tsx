import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/src/store';
import light from '@/themes/light';

const GlobalStyle = createGlobalStyle`
  body, html {
    padding: 0;
    margin: 0;
    min-height: 100vh;
  }
  body {
    background-color: #fdfdfd;
    font-family: 'Varta', sans-serif;
    font-size: 14px;
    line-height: 1.25;
    color: ${light.color.grey[600]};

    * {
      box-sizing: border-box;
    }

    > div {
      min-height: 100vh;
      padding-top: 60px;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Varta', Helvetica, sans-serif;
    font-weight: 400;
    color: ${light.color.grey[700]};
  }
  h1 {
    font-size: 1.7rem;
    margin-bottom: .5rem;
  }
`;

type Props = {
  domElement: HTMLElement | null;
  component: ReactNode;
};

export const createPage = ({ domElement, component }: Props) => {
  //   const appContainer = document.querySelector('#app-container');
  if (!domElement) {
    throw new Error('Can not find DOM element');
  }
  const root = createRoot(domElement);
  root.render(
    <ReduxProvider store={store}>
      <ThemeProvider theme={light}>
        <GlobalStyle />
        {component}
      </ThemeProvider>
    </ReduxProvider>
  );
};
