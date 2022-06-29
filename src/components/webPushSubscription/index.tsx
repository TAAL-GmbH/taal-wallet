import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/src/hooks';
import { getWebPushToken } from '../../utils/firebase';
import { Button } from '../button';
import { QuickWalletSelector } from '../quickWalletSelector';

type Props = {
  className?: string;
};

type Message = {
  title: string;
  body: string;
  action: string;
  address: string;
  payload: string;
};

export const WebPushSubscription: FC<Props> = ({ className }) => {
  const { activePk, map } = useAppSelector(state => state.pk);

  const [formData, setFormData] = useState<Message>({
    title: 'Title',
    body: 'Message Body',
    action: 'balance',
    address: activePk?.address || '',
    payload: '{ "amount": 123456789 }',
  });
  const [result, setResult] = useState<unknown>({});
  const [token, setToken] = useState<string>('Loading...');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const list = Object.values(map);

  useEffect(() => {
    (async () => setToken(await getWebPushToken()))();
  }, []);

  const onInput = (name: string, value: string) => {
    setFormData(state => ({ ...state, [name]: value }));
  };

  const parsePayload = () => {
    try {
      const payload = JSON.parse(formData.payload);
      return payload;
    } catch (e) {
      return {};
    }
  };

  const pushMessage = async () => {
    const body = {
      token,
      title: formData.title,
      body: formData.body,
      data: {
        action: 'balance',
        payload: {
          address: formData.address || activePk?.address,
          ...parsePayload(),
        },
      },
    };

    const resp = await fetch('http://localhost:3001/', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(body),
    });

    const result = await resp.json();
    setResult(result);
  };

  return (
    <Wrapper className={className}>
      <h1>WebPush Subscription</h1>
      <QuickWalletSelector />
      <fieldset>
        <legend>WebPush Token</legend>
        <textarea ref={textareaRef} rows={5} readOnly value={token} />
      </fieldset>

      <InputFieldsWrapper>
        <input
          type="text"
          name="title"
          value={formData.title}
          onInput={(e: ChangeEvent<HTMLInputElement>) => onInput(e.target.name, e.target.value)}
        />
        <input
          type="text"
          name="body"
          value={formData.body}
          onInput={(e: ChangeEvent<HTMLInputElement>) => onInput(e.target.name, e.target.value)}
        />
        <select
          name="address"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onInput(e.target.name, e.target.value)}
        >
          {list.map(pk => (
            <option value={pk.address} key={pk.address}>
              {pk.address}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="action"
          value={formData.action}
          onInput={(e: ChangeEvent<HTMLInputElement>) => onInput(e.target.name, e.target.value)}
        />
        <textarea
          name="payload"
          value={formData.payload}
          onInput={(e: ChangeEvent<HTMLTextAreaElement>) => onInput(e.target.name, e.target.value)}
        />
        <Button onClick={pushMessage}>Push Message</Button>
      </InputFieldsWrapper>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  fieldset {
    margin: 2rem 0;
    border: 1px solid #ccc;

    textarea {
      width: 100%;
      border: none;
      :focus {
        outline: none;
      }
    }
  }
`;

const InputFieldsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;
