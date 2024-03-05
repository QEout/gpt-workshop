//assistant context

import { useRequest } from 'ahooks';
import OpenAI from 'openai';
import { createContext, useContext, useState } from 'react';
import { assistantService } from '~/services/assistant';
interface AssistantContextProps {
  assistant?: OpenAI.Beta.Assistant | null;
  refresh?: () => void;
}


const AssistantContext = createContext<AssistantContextProps>({});

export const useAssistantContext = () => useContext(AssistantContext);

export const AssistantProvider = ({ assistantId, children }: {
  children: React.ReactNode;
  assistantId: string;
}) => {
  const { data: assistant, refresh } = useRequest(() => assistantService.retrieveAssistant(assistantId),
    {
      ready: !!assistantId,
      refreshDeps: [assistantId]
    });
  return (
    <AssistantContext.Provider value={{ assistant, refresh }}>
      {children}
    </AssistantContext.Provider>
  );
};
