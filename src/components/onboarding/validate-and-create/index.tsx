import { FC, useState } from 'react';
import styled, { css } from 'styled-components';
import toast from 'react-hot-toast';

import { db } from '@/db';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { gap, padding } from '@/utils/inject-spacing';
import { navigateTo } from '@/utils/navigation';
import { routes } from '@/constants/routes';
import { CreateAccountReturnType } from '@/utils/account-factory';
import { isBackgroundPageResponding } from '@/utils/communication';
import { clearState } from '@/features/onboarding-slice';
import { ButtonWrapper } from '@/generic/button-wrapper';
import { Button } from '@/generic/button';
import { Note } from '@/generic/note';
import { randomizeArray } from '@/utils/generic';
import { OnboardingHeading } from '@/components/onboarding/onboarding-header';

type ErrorMap = {
  [word: string]: ReturnType<typeof setTimeout> | null;
};

type Props = {
  mnemonicPhrase: string;
};

export const ValidateAndCreate: FC<Props> = ({ mnemonicPhrase }) => {
  const [mnemonic] = useState(() => {
    const wordList = mnemonicPhrase.split(' ');
    return {
      phrase: mnemonicPhrase,
      wordList,
      wordListRandomized: randomizeArray(wordList),
    };
  });
  const [wordListCopy, setWordListCopy] = useState([...mnemonic.wordList]);
  const [errorMap, setErrorMap] = useState<ErrorMap>({});

  const { accountName, networkId, password } = useAppSelector(state => state.onboarding);
  const dispatch = useAppDispatch();

  const isSuccessful = wordListCopy.length <= 9;

  const createAccount = async () => {
    if (!(await isBackgroundPageResponding())) {
      console.error('background page is not responding');
      return navigateTo(routes.ERROR);
    }

    const result: CreateAccountReturnType = await chrome.runtime.sendMessage({
      action: 'bg:createAccount',
      payload: {
        accountName,
        networkId,
        password,
        mnemonicPhrase: mnemonic.phrase,
        action: 'createNew',
      },
    });

    console.log('account creation result', result);

    if (result.success === true) {
      // don't forget to switch database to new account
      await db.useAccount(result.data.accountId);
      toast.success('Account created successfully');
      dispatch(clearState());
      navigateTo(routes.HOME);
    } else {
      toast.error(result?.error?.message || 'Error creating account');
    }
  };

  const clearErrorWord = (word: string) => {
    setErrorMap(map => {
      const mapCopy = { ...map };
      delete mapCopy[word];
      return mapCopy;
    });
  };

  const onErrorWord = (word: string) => {
    setErrorMap(map => {
      if (map[word]?.constructor === setTimeout) {
        clearTimeout(map[word]);
      }
      return {
        ...errorMap,
        [word]: setTimeout(() => {
          clearErrorWord(word);
        }, 1000),
      };
    });
  };

  const onWordClick = (word: string) => {
    if (isSuccessful) {
      return;
    }
    if (wordListCopy[0] === word) {
      setWordListCopy(list => list.slice(1));
    } else {
      onErrorWord(word);
    }
  };

  const isDev = process?.env?.NODE_ENV === 'development';

  return (
    <>
      <OnboardingHeading
        heading={
          isSuccessful ? null : 'Please select first 3 words of your secret phrase in the correct order'
        }
        progress={100}
      />

      {isSuccessful && <Note variant="success">You have successfully backed up your secret phrase</Note>}

      {!isSuccessful && (
        <WordWrapper>
          {mnemonic.wordListRandomized.map((word, index) => (
            <Word
              key={index}
              onClick={() => onWordClick(word)}
              $hasError={!!errorMap[word]}
              $wasSuccess={!wordListCopy.includes(word)}
            >
              {isDev && word}
            </Word>
          ))}
        </WordWrapper>
      )}

      <ButtonWrapper margin="xxl 0 md">
        <Button variant="transparent" onClick={() => navigateTo(routes.DISPLAY_MNEMONIC)}>
          Back
        </Button>
        <Button variant="primary" onClick={createAccount} isDisabled={!isSuccessful}>
          Proceed
        </Button>
      </ButtonWrapper>

      {!isSuccessful && <h3 style={{ opacity: 0.4 }}>{wordListCopy[0]}</h3>}
    </>
  );
};

const WordWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  ${gap`sm`};
`;

const Word = styled.span<{ $hasError: boolean; $wasSuccess: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.color.grey[300]};
  height: 40px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  ${({ theme }) => theme.typography.body3};
  ${padding`sm xs`};

  ${({ $hasError, $wasSuccess, theme }) =>
    !$hasError &&
    !$wasSuccess &&
    css`
      &:hover {
        background-color: ${theme.color.primary[50]};
        border-color: ${theme.color.primary[500]};
      }
    `};

  ${({ $hasError, theme }) =>
    $hasError &&
    css`
      border-color: ${theme.color.error[500]};
      background-color: ${theme.color.error[50]};
    `};

  ${({ $wasSuccess, theme }) =>
    $wasSuccess &&
    css`
      border-color: ${theme.color.success[500]};
      background-color: ${theme.color.success[50]};
    `};
`;
