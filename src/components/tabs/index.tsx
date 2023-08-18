import { FC, ReactNode, useState } from 'react';
import styled from 'styled-components';

import { injectSpacing, padding } from '@/utils/inject-spacing';
import { Note } from '@/generic/note';
import { InjectSpacing } from '@/types/index';

type Item = {
  title: string;
  icon?: ReactNode;
  content: ReactNode;
};

type Props = {
  items: Item[];
  activeIndex?: number;
  onChange?: (tabIndex: number) => void;
  margin?: string;
  padding?: string;
};

export const Tabs: FC<Props> = ({ items, activeIndex = 0, onChange, margin = 'sm 0', padding = 'sm' }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(activeIndex);

  const onChangeTab = (tabIndex: number) => {
    if (activeTabIndex === tabIndex) {
      return;
    }
    setActiveTabIndex(tabIndex);
    if (typeof onChange === 'function') {
      onChange(tabIndex);
    }
  };

  return (
    <Wrapper $margin={margin}>
      <TabsWrapper>
        {items.map((item, index) => (
          <Tab
            key={item.title}
            role="button"
            $isActive={index === activeTabIndex}
            onClick={() => onChangeTab(index)}
          >
            {item.icon || null}
            <span>{item.title}</span>
          </Tab>
        ))}
      </TabsWrapper>
      <ContentWrapper $padding={padding}>
        {items[activeTabIndex] ? items[activeTabIndex].content : <Note variant="danger">Tab not found</Note>}
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div<InjectSpacing>`
  ${injectSpacing(['margin'])};
`;

const TabsWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.color.grey[200]};
`;

const Tab = styled.div<{ $isActive: boolean }>`
  ${({ theme }) => theme.typography.heading7};
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
  ${padding`sm md xs`};
  border-bottom: 1px solid ${({ $isActive, theme }) => ($isActive ? theme.color.primary[600] : 'transparent')};
  color: ${({ $isActive, theme }) => ($isActive ? theme.color.primary[600] : theme.color.grey[500])};
  cursor: pointer;

  svg {
    max-height: 16px;
    fill: currentColor;
  }
`;

const ContentWrapper = styled.div<InjectSpacing>`
  position: relative;
  overflow: hidden;

  ${injectSpacing(['padding'])};
`;
