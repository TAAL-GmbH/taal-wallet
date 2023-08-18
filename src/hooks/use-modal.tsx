import { FC, useEffect, useState } from 'react';

import { Modal, ModalProps } from '@/components/generic/modal';

export const useModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // prevent body from scrolling when modal is visible
    document.body.style.overflow = isVisible ? 'hidden' : 'unset';
  }, [isVisible]);

  const RenderModal: FC<ModalProps> = ({ onClose, ...rest }) =>
    isVisible ? (
      <Modal
        onClose={() => {
          if (typeof onClose === 'function') {
            onClose();
          }
          setIsVisible(false);
        }}
        {...rest}
      />
    ) : null;

  const RenderLgModal: FC<ModalProps> = ({ onClose, ...rest }) =>
    isVisible ? (
      <Modal
        onClose={() => {
          if (typeof onClose === 'function') {
            onClose();
          }
          setIsVisible(false);
        }}
        {...rest}
      />
    ) : null;

  return {
    isVisible,
    setIsVisible,
    show: () => setIsVisible(true),
    close: () => setIsVisible(false),
    RenderModal,
    RenderLgModal,
  };
};
