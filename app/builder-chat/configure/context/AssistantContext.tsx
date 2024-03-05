//assistant context
import { useRequest } from 'ahooks';
import { createContext, useContext } from 'react';
import { IChatAssistantType, chatAssistantService } from '~/services/chatAssistant';
interface AssistantContextProps {
  assistant?: IChatAssistantType | null;
  refresh?: () => void;
}

const AssistantContext = createContext<AssistantContextProps>({});

export const useAssistantContext = () => useContext(AssistantContext);

export const AssistantProvider = ({ assistantId, children }: {
  children: React.ReactNode;
  assistantId: string;
}) => {
  const { data: assistant, refresh } = useRequest(() => chatAssistantService.retrieveAssistant(assistantId),
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
