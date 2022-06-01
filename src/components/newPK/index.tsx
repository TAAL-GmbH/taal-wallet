import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { pk } from '@/src/libs/PK';
import { Button } from '../button';
import { Mnemonic } from 'bsv';

type Props = {
  className?: string;
};

export const NewPk: FC<Props> = ({ className }) => {
  const mnemonic = useRef<Mnemonic>();
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string>('');

  useEffect(() => {
    mnemonic.current = pk.generateMnemonic();
    setMnemonicPhrase(mnemonic?.current?.phrase || '');
  }, []);

  const createHDPK = () => {
    if (!mnemonic.current) {
      alert('mnemonic is empty');
      return;
    }
    pk.createHDPK({
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
      <Textarea value={mnemonicPhrase} readOnly />
      <Button onClick={createHDPK}>Next</Button>
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
