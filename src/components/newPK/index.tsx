import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { pk } from '@/src/libs/PK';
import { Button } from '../button';
import { Mnemonic } from '@/src/types';

type Props = {
  className?: string;
};

export const NewPk: FC<Props> = ({ className }) => {
  const mnemonic = useRef<Mnemonic>();
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string>('');

  useEffect(() => {
    (async () => {
      mnemonic.current = await pk.generateMnemonic();
      setMnemonicPhrase(mnemonic?.current?.phrase || '');
    })();
  }, []);

  const createPK = () => {
    pk.createPK({
      mnemonic: mnemonic.current,
    });
    window.location.hash = '#';
  };

  return (
    <Wrapper className={className}>
      <h1>Create a New PK</h1>
      <p>
        These are your 12 words, copy them and store them in a secure place:
      </p>
      <Textarea value={mnemonicPhrase} />
      <Button onClick={createPK}>Next</Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  //
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 60px;
`;
