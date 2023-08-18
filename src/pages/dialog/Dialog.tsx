import { FC, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { Button } from '@/components/generic/button';
import { DialogData } from '@/types';
import { DialogContent } from './dialog-content';
import { padding } from '@/utils/inject-spacing';

let bc: BroadcastChannel;
let remainingTimeInterval: ReturnType<typeof setInterval>;

export const Dialog: FC = () => {
  const dialogId = new URLSearchParams(location.search).get('id');
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimeouted, setIsTimeouted] = useState(false);
  const timeoutRef = useRef(0);

  useEffect(() => {
    if (!dialogId) {
      setDialogData({
        error: `dialogData not set in query params`,
      } as DialogData);
    } else {
      bc = new BroadcastChannel(`dialog-${dialogId}`);
      bc.onmessage = ({ data }: { data: { action: string; payload?: unknown } }) => {
        if (data?.action === 'getData') {
          setDialogData(data?.payload as DialogData);
          const timeout = (data?.payload as DialogData)?.timeout;

          if (timeout > 0) {
            timeoutRef.current = timeout;
            setTimeRemaining(timeout / 1000);

            remainingTimeInterval = setInterval(() => {
              setTimeRemaining(prev => prev - 1);
            }, 1000);

            setTimeout(() => {
              // TODO: show expired message
              // window.close();
              setIsTimeouted(true);
            }, timeout);
          }
        }
      };

      bc.postMessage({ action: 'getData' });
      window.onbeforeunload = () => {
        bc.postMessage({
          action: 'response',
          payload: {
            selectedOption: -1,
          },
        });
      };
      return () => clearInterval(remainingTimeInterval);
    }
  }, []);

  useEffect(() => {
    if (dialogData?.resizeWindow) {
      // TODO: implement or remove this
      // window.resizeTo(dialogData.width, dialogData.height);
    }
  }, [dialogData]);

  const respond = async (index: number) => {
    bc.postMessage({
      action: 'response',
      payload: {
        selectedOption: dialogData?.options[index].returnValue || index,
      },
    });

    bc.close();
    window.onbeforeunload = null;
    window.close();
  };

  if (!dialogData) {
    return <Wrapper>Loading...</Wrapper>;
  }

  if (dialogData?.error) {
    return <Error>{dialogData.error}</Error>;
  }

  return (
    <Wrapper $fitView={dialogData.fitView} $isTimeouted={isTimeouted} $hasTimer={timeRemaining > 0}>
      {timeRemaining > 0 && <TimeRemaining>Time remaining: {timeRemaining} seconds</TimeRemaining>}
      {isTimeouted && <TimeRemaining>Time is up! Please restart this process.</TimeRemaining>}

      <DialogContent title={dialogData.title} dialogType={dialogData.dialogType} data={dialogData.data} />

      {!!dialogData.options?.length && (
        <ButtonWrapper>
          {!isTimeouted &&
            dialogData.options.map(({ label, variant }, index) => (
              <Button key={index} onClick={() => respond(index)} variant={variant}>
                {label}
              </Button>
            ))}
          {isTimeouted && (
            <Button onClick={() => window.close()} variant="primary">
              Close window
            </Button>
          )}
        </ButtonWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ $fitView?: boolean; $isTimeouted?: boolean; $hasTimer?: boolean }>`
  min-height: 100vh;
  max-width: 500px;
  width: 100vw;
  padding: 1rem;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  box-sizing: border-box;

  &:after {
    content: '';
    padding-top: 60px;
  }

  ${({ $hasTimer }) =>
    $hasTimer &&
    css`
      &:before {
        content: '';
        padding-top: 20px;
      }
    `};

  ${({ $fitView }) =>
    $fitView &&
    css`
      height: 100vh;
    `}

  ${({ $isTimeouted }) =>
    $isTimeouted &&
    css`
      filter: contrast(-100) saturate(-100);
    `}
`;

const Error = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.color.danger[400]};
  padding: 2rem;
`;

const TimeRemaining = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: ${({ theme }) => theme.color.accent[600]};
  color: ${({ theme }) => theme.color.grey[800]};
  text-align: center;
  ${padding`10px md sm`};
`;

const ButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);

  button {
    width: 100%;
    flex: 1;
  }
`;
