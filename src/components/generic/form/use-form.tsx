import { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useForm as useReactHookForm, FormProvider, UseFormProps, WatchObserver, FieldValues, SubmitHandler } from 'react-hook-form';

type Props<T extends FieldValues, C> = {
  children: ReactNode;
  className?: string;
  onSubmit: SubmitHandler<T>;
  onChange?: WatchObserver<T>;
  hasDarkBg?: boolean;
  options?: UseFormProps<T, C>;
  isDisabled?: boolean;
};

type StyledProps = {
  hasDarkBg?: boolean;
};

export const useForm = <T extends FieldValues, C>(options?: UseFormProps<T, C>) => {
  const methodsRef = useRef(
    useReactHookForm({
      criteriaMode: 'all',
      mode: 'all',
      ...options,
    })
  );

  const { watch } = methodsRef.current;

  const Form = useMemo<FC<Props<T, C>>>(
    () =>
      function FormComponent({ className, children, onSubmit, onChange, hasDarkBg, isDisabled }: Props<T, C>) {
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
              noValidate
            >
              {isDisabled ? <fieldset disabled={true}>{children}</fieldset> : children}
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
        --errorColor: ${theme.color.danger[600]};
        --mainColor: ${theme.color.grey[600]};
        --primaryColor: ${theme.color.primary[400]};
        --borderColor: ${theme.color.grey[100]};
        --focusColor: rgb(0, 0, 0, 0.05);
      `;
    }
  }}

  fieldset[disabled] {
    padding: 0;
    margin: 0;
    border: 0;
  }
`;
