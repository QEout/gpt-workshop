import React, { useEffect, useRef, useState } from 'react';
import AssistantChat from '@/components/chat/AssistantChat';
import MessageInput from '@/components/chat/MessageInput';

import {
  experimental_useAssistant as useAssistant, useCompletion,
} from 'ai/react';
import { useAssistantContext } from '../context/AssistantContext';
import { useAIComplete } from '@/app/hooks/useAIComplete';
import { FileData } from '@/components/upload';

const RightPanel = () => {
  const { assistant } = useAssistantContext();
  const [threadFiles, setThreadFiles] = useState<FileData[]>([]);
  const { status, messages, threadId, input, submitMessage, handleInputChange } = useAssistant({
    api: '/api/assistant/run', body: {
      assistantId: assistant?.id,
      fileIds: threadFiles.map((file) => file.fileId),
    }
  });

  const {complete,...rest}=useAIComplete({type: 'assistant'});
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollTop = msgRef.current.scrollHeight;
    }
  },[messages.length]);

  useEffect(() => {
    if(status === 'awaiting_message'){
      if(messages[messages.length - 1]?.role === 'assistant'){
        complete(messages[messages.length - 1].content);
      }
      setThreadFiles([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="w-1/2 h-screen p-8 pr-0 pt-5 flex flex-col gap-6">
      <div className="flex items-center justify-between ">
        <span className=" font-semibold text-gray-400">Preview
          &nbsp;
          <span className="text-gray-500 text-sm">
            {threadId}
          </span>
        </span>
      </div>
      <div ref={msgRef} className='flex-1 pr-8 overflow-y-auto'>
        <AssistantChat
          messages={messages}
          status={status}
        />
      </div>
      <div className="w-full pr-8">
        <MessageInput
          input={input}
          handleInputChange={handleInputChange}
          submitMessages={submitMessage}
          isLoading={status !== "awaiting_message"}
          {...rest}
          files={threadFiles}
          setFiles={setThreadFiles}
        />
      </div>
    </div>
  );
};


export default RightPanel;