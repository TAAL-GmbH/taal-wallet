import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { CloseIcon } from '@/svg/close-icon';
import { IconButton } from '@/generic/icon-button';
import { gap, injectSpacing, padding } from '@/utils/inject-spacing';
import { InjectSpacing } from '@/types';

export type ModalProps = {
  title?: string | ReactNode;
  children: ReactNode;
  onClose?: () => void;
  showCloseBtn?: boolean;
  padding?: string;
};

// // this function injects onClose action to each ModalButton click handler
// const injectOnClose = (onClose: () => void) => (item: ReactElement<ButtonProps>) => {
//   if (React.isValidElement(item)) {
//     const onClick = (item.props as ButtonProps)?.onClick;
//     return cloneElement(item as FunctionComponentElement<ButtonProps>, {
//       onClick: () => {
//         if (typeof onClick === 'function') {
//           onClick();
//         }
//         onClose();
//       },
//     });
//   }
//   return null;
// };

export const Modal: FC<ModalProps> = ({
  title,
  onClose = () => {},
  children,
  padding = '0 md md',
  showCloseBtn,
}) => {
  return (
    <Backdrop onClick={onClose}>
      <ModalWindow onClick={e => e.stopPropagation()}>
        {title && <Title>{title}</Title>}

        {showCloseBtn && (
          <IconButtonStyled onClick={onClose}>
            <CloseIcon />
          </IconButtonStyled>
        )}

        <Contents $padding={padding}>{children}</Contents>
      </ModalWindow>
    </Backdrop>
  );
};

const Backdrop = styled.div`
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalWindow = styled.div<{ sizeLg?: boolean }>`
  position: relative;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 0 14px 0 rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  min-width: 350px;
  max-width: 600px;
  max-height: 90vh;
  min-height: 120px;
  ${gap`xs`};
`;

const IconButtonStyled = styled(IconButton)`
  position: absolute;
  top: ${p => p.theme.spacing.md};
  right: ${p => p.theme.spacing.md};
`;

const Title = styled.div`
  ${({ theme }) => theme.typography.heading5};
  color: ${({ theme }) => theme.color.primary[600]};
  ${padding`md`};
`;

const Contents = styled.div<InjectSpacing>`
  overflow-y: auto;
  flex: 1;
  ${injectSpacing(['padding'])};
`;
