import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import xss from 'xss';
import { Button } from '@/src/components/button';
import { DialogData } from '@/src/types';

export const Dialog: FC = () => {
  const dialogId = new URLSearchParams(location.search).get('id');
  const storageKey = `dialog: ${dialogId}`;
  const [dialogData, setDialogData] = useState<DialogData | null>(null);

  useEffect(() => {
    if (!dialogId) {
      setDialogData({
        error: `dialogData not set in query params`,
      } as DialogData);
    } else {
      (async () => {
        const stateData = await chrome.storage.local.get(storageKey);
        setDialogData(
          stateData[storageKey] || {
            error: `dialogData not found in Chrome storage [${storageKey}]`,
          }
        );
        // close window if user is not responding in predefined time
        if (stateData[storageKey].timeout > 0) {
          setTimeout(() => {
            // TODO: show expired message
            window.close();
          }, stateData[storageKey].timeout);
        }
      })();
    }
  }, []);

  const respond = async (index: number) => {
    await chrome.storage.local.set({
      [storageKey]: {
        ...dialogData,
        response: dialogData?.options[index].returnValue || index,
      },
    });
    window.close();
  };

  if (!dialogData) {
    return <Wrapper>Loading...</Wrapper>;
  }

  if (dialogData?.error) {
    return <Error>{dialogData.error}</Error>;
  }

  return (
    <Wrapper>
      <h1>{dialogData.title}</h1>
      {!!dialogData.body && (
        <div dangerouslySetInnerHTML={{ __html: xss(dialogData.body) }} />
      )}

      <ButtonWrapper>
        {dialogData.options.map(({ label, variant }, index) => (
          <Button key={index} onClick={() => respond(index)} variant={variant}>
            {label}
          </Button>
        ))}
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

const Error = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.color.danger[400]};
  padding: 2rem;
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
