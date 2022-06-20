import { FC, useRef } from 'react';
import styled from 'styled-components';
import { Button } from '@/src/components/button';

export const Auth: FC = () => {
  const dontAskAgain = useRef(false);
  const origin = new URLSearchParams(location.search).get('origin');
  const storageKey = `origin: ${origin}`;

  const allow = async () => {
    const namespace = dontAskAgain.current ? 'local' : 'session';
    console.log(`allow in ${namespace}`);
    // @ ts-expect-error storage.session is supported only in manifest v3
    const originData = await chrome.storage[namespace].get(storageKey);
    chrome.storage.local.set({
      [storageKey]: {
        ...originData,
        isAuthorized: true,
      },
    });
    window.close();
  };

  const reject = async () => {
    const namespace = dontAskAgain.current ? 'local' : 'session';
    // @ ts-expect-error storage.session is supported only in manifest v3
    const originData = await chrome.storage[namespace].get(storageKey);
    console.log(`reject in ${namespace}`);
    chrome.storage.local.set({
      [storageKey]: {
        ...originData,
        isAuthorized: false,
      },
    });
    window.close();
  };

  return (
    <Wrapper>
      <h1>Page authentication</h1>
      <div>
        Page with origin
        <Origin>{origin}</Origin>
        wants to access your wallet.
      </div>
      <div>Do you want to allow it?</div>
      <div>
        <label>
          <input
            type="checkbox"
            onChange={e => (dontAskAgain.current = e.target.checked)}
          />
          Don't ask again for this origin
        </label>
      </div>
      <ButtonWrapper>
        <Button onClick={allow} variant="primary">
          Yes
        </Button>
        <Button onClick={reject}>No</Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-height: 100vh;
  max-width: 500px;
  width: 100vw;
  padding: 1rem;
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Origin = styled.div`
  font-family: monospace;
  font-weight: bold;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  max-width: 400px;

  button {
    width: 100%;
    flex: 1;
  }
`;
