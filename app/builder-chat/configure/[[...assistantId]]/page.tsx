'use client';

import React from 'react';
import LeftPanel from '../Left_Side/LeftPanel_Component';
import RightPanel from '../Right_Side/RightPanel_Component';
import { AssistantProvider } from '../context/AssistantContext';

const ConfigurePage = (props: { params: { assistantId: string[] } }) => {
  const { assistantId } = props.params;
  return (
    <AssistantProvider assistantId={assistantId?.[0]}>
      <div className="flex bg-background font-sans">
        <LeftPanel />
        <RightPanel />
      </div>
    </AssistantProvider>
  );
};

export default ConfigurePage;