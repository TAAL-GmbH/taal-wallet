import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import xss from 'xss';
import { Button } from '@/src/components/button';
import { DialogData } from '@/src/types';

let bc: BroadcastChannel;

export const Dialog: FC = () => {
  const dialogId = new URLSearchParams(location.search).get('id');
  const [dialogData, setDialogData] = useState<DialogData | null>(null);

  useEffect(() => {
    if (!dialogId) {
      setDialogData({
        error: `dialogData not set in query params`,
      } as DialogData);
    } else {
      bc = new BroadcastChannel(`dialog-${dialogId}`);
      bc.onmessage = ({
        data,
      }: {
        data: { action: string; payload?: unknown };
      }) => {
        if (data?.action === 'getData') {
          setDialogData(data?.payload as DialogData);
          const timeout = (data?.payload as DialogData)?.timeout;

          if (timeout > 0) {
            setTimeout(() => {
              // TODO: show expired message
              window.close();
            }, timeout);
          }
        }
      };

      bc.postMessage({ action: 'getData' });
    }
  }, []);

  const respond = async (index: number) => {
    bc.postMessage({
      action: 'response',
      payload: {
        selectedOption: dialogData?.options[index].returnValue || index,
      },
    });

    bc.close();
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
