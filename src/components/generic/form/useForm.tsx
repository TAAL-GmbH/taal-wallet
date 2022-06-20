import { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';
import { UseFormProps, WatchObserver } from 'react-hook-form';
import { useForm as useReactHookForm, FormProvider } from 'react-hook-form';

type Props = {
  children: ReactNode;
  className?: string;
  onSubmit: (arg0: unknown) => void;
  onChange?: WatchObserver<{ [x: string]: unknown }>;
  hasDarkBg?: boolean;
  options?: UseFormProps;
  'data-test-id': string;
};

type StyledProps = {
  hasDarkBg?: boolean;
};

export const useForm = (options?: UseFormProps) => {
  const methodsRef = useRef(
    useReactHookForm<typeof options.defaultValues>({
      criteriaMode: 'all',
      mode: 'all',
      ...options,
    })
  );

  const { watch } = methodsRef.current;

  const Form = useMemo<FC<Props>>(
    () =>
      function FormComponent({
        className,
        children,
        onSubmit,
        onChange,
        hasDarkBg,
        'data-test-id': dataTestId,
      }: Props) {
        useEffect(() => {
          if (typeof onChange === 'function') {
            const subscription = watch(onChange);
            return () => subscription.unsubscribe();
          }
        }, [onChange]);

        return (
          <FormProvider {...methodsRef.current}>
            <FormElement
              onSubmit={methodsRef.current.handleSubmit(onSubmit)}
              className={className}
              hasDarkBg={hasDarkBg}
              data-test-id={dataTestId}
              noValidate
            >
              {children}
            </FormElement>
          </FormProvider>
        );
      },
    [watch]
  );

  return { Form, methods: methodsRef.current };
};

const FormElement = styled.form<StyledProps>`
  ${({ theme, hasDarkBg }) => {
    if (hasDarkBg) {
      return css`
        --errorColor: ${theme.color.danger[200]};
        --mainColor: white;
        --primaryColor: white;
        --borderColor: white;
        --focusColor: rgba(0, 0, 0, 0.2);
      `;
    } else {
      return css`
        --errorColor: ${theme.color.danger[400]};
        --mainColor: ${theme.color.grey[600]};
        --primaryColor: ${theme.color.primary[400]};
        --borderColor: ${theme.color.grey[100]};
        --focusColor: rgb(0, 0, 0, 0.05);
      `;
    }
  }}
`;
