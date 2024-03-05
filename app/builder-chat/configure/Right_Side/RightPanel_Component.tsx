import React, { useEffect, useRef, useState } from 'react';
import ChatAssistantChat from '@/components/chat/ChatAssistantChat';
import MessageInput, { IInputConfigType } from '@/components/chat/MessageInput';

import { useChat, useCompletion, } from 'ai/react';
import { useAssistantContext } from '../context/AssistantContext';
import toast from 'react-hot-toast';
import { useAIComplete } from '@/app/hooks/useAIComplete';
import { FileData } from '@/components/upload';

const RightPanel = () => {
  const { assistant } = useAssistantContext();
  const { complete, ...rest } = useAIComplete({ type: 'chat' });
  const [steamReady, setStreamReady] = useState(false);
  const { id, createdAt, updatedAt, ...assistantData } = assistant || {};
  const { data, messages, reload, stop, isLoading, input, handleSubmit, handleInputChange } = useChat({
    api: '/api/chatAssistant/run',
    body: {
      ...assistantData,
      temperature: rest.config.temperature,
    },
    onResponse: () => {
      setStreamReady(true);
    },
    onFinish: (res) => {
      setStreamReady(false);
      complete(res.content);
    },
    onError: (err) => {
      setStreamReady(false);
      console.error(err);
      toast.error('发送消息失败');
    }
  });

  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollTop = msgRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="w-1/2 h-screen p-8 pr-0 pt-5 flex flex-col gap-6">
      <div ref={msgRef} className='flex-1 pr-8 overflow-y-auto'>
        <ChatAssistantChat
          messages={messages}
          data={data}
          isLoading={isLoading}
          reload={reload}
          stop={stop}
          steamReady={steamReady}
        />
      </div>
      <div className="w-full pr-8">
        <MessageInput
          input={input}
          handleInputChange={handleInputChange}
          submitMessages={handleSubmit}
          isLoading={isLoading}
          {...rest}
        />
      </div>
    </div>
  );
};


export default RightPanel;