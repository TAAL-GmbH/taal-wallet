import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import bsv from 'bsv';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@/store';
import light from '@/themes/light';

// adjust DUST_AMOUNT to 0 in frontend entry point
// @ts-expect-error DUST_AMOUNT is not typed
bsv.Transaction.DUST_AMOUNT = 0;

const GlobalStyle = createGlobalStyle`
  body, html {
    padding: 0;
    margin: 0;
    min-width: ${light.constant.bodyMinWidth};
    box-sizing: border-box;
    font-weight: 400;
    font-family: ${light.fontFamily.primary};
    ${light.typography.body3};
  }

  body::-webkit-scrollbar{
    display: none;
  }

  @media (max-width: 600px) {
    body, html {
      // min-height: ${light.constant.bodyMinHeightMobile};
    }
  }

  #tooltip-container {
    position: relative;

    > * {
      position: absolute;
      z-index: 1000;
    }
  }

  svg {
    fill: currentColor;
  }

  a {
    text-decoration: none;
    color: ${light.color.primary[700]};

    &:hover {
      text-decoration: underline;
    }

    svg {
      max-height: 1.2em;
      max-width: 1.2em;
      margin: 0 .2em;
    }
  }

  #app {
    min-width: ${light.constant.bodyMinWidth};
    min-height: ${light.constant.bodyMinHeightMobile};
  }

  @keyframes fadein {
    0% { opacity: 0 }
    100% { opacity: 1 }
  }
  .fadein {
    animation-name: fadein;
    animation-duration: .5s;
    animation-timing-function: ease-in-out;
  }
`;

type Props = {
  domElement: HTMLElement | null;
  component: ReactNode;
  theme?: typeof light;
};

export const createPage = ({ domElement, component, theme = light }: Props) => {
  if (!domElement) {
    throw new Error('Can not find DOM element');
  }
  const root = createRoot(domElement);
  root.render(
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {component}
      </ThemeProvider>
    </ReduxProvider>
  );
};
