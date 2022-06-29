import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  className?: string;
  contents?: string | ReactNode;
};

const TooltipComponent: FC<{ contents: Props['contents']; domRect: any }> = ({ contents, domRect }) => {
  return ReactDOM.createPortal(
    <TooltipBody
      style={{
        top: `${domRect.top + document.documentElement.scrollTop - 5}px`,
        left: `${domRect.left + document.documentElement.scrollLeft + domRect.width / 2}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {contents}
    </TooltipBody>,
    document.querySelector('#tooptip-container') as HTMLElement
  );
};

export const Tooltip: FC<Props> = ({ className, children, contents }) => {
  const wrapperRef = useRef<HTMLSpanElement>();
  const [domRect, setDomRect] = useState<DOMRect>(null);
  const [isVisible, setIsVisible] = useState(false);

  const onHover = () => {
    if (wrapperRef.current) {
      const box = wrapperRef.current.getBoundingClientRect();
      setDomRect(box);
      setIsVisible(true);
    }
  };

  return (
    <>
      {isVisible && <TooltipComponent contents={contents} domRect={domRect} />}
      <Wrapper
        className={className}
        onMouseOver={onHover}
        onMouseOut={() => setIsVisible(false)}
        ref={wrapperRef}
      >
        {children}
      </Wrapper>
    </>
  );
};

const Wrapper = styled.span`
  position: relative;
`;

const TooltipBody = styled.span`
  font-size: 0.8rem;
  border-radius: 0.4rem;
  background-color: black;
  color: white;
  padding: 0.4rem 0.5rem 0.2rem;
  text-align: center;

  &::after {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -4px;
    content: ' ';
    width: 0;
    height: 0;
    border-width: 4px 8px 0 8px;
    border-color: #000 transparent transparent transparent;
    border-style: solid;
  }
`;
