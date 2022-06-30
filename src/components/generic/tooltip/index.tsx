import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  className?: string;
  contents?: string | ReactNode;
};

const TooltipComponent: FC<{ contents: Props['contents']; domRect: any }> = ({ contents, domRect }) => {
  const ref = useRef<HTMLSpanElement>();
  const tooltipHeight = ref.current?.getBoundingClientRect().height || 30;
  const tooltipWidth = ref.current?.getBoundingClientRect().width || 60;

  return ReactDOM.createPortal(
    <TooltipBody
      className="fadein"
      ref={ref}
      style={{
        top: `${domRect.top + document.documentElement.scrollTop - tooltipHeight - 10}px`,
        left: `${domRect.left + document.documentElement.scrollLeft - tooltipWidth / 2}px`,
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
    bottom: -3px;
    content: ' ';
    width: 0;
    height: 0;
    border-width: 4px 8px 0 8px;
    border-color: #000 transparent transparent transparent;
    border-style: solid;
  }
`;
