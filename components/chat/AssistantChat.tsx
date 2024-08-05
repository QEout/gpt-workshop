import React from 'react';
import { Message } from 'ai/react';
import { cn } from '@/lib/utils';
import { Editor } from '@tiptap/core';
import { DataMessage, IChatMessage, NormalMessage } from './MessageItem';

const AssistantChat = ({
  status,
  editor,
  messages,
}: {
  status: string;
  messages: Message[];
  editor?: Editor | null;
}) => {
  return (
    <div className="flex flex-col w-full gap-4">
      {messages.map((message, idx) => {
        const m = message as unknown as IChatMessage;
        return (
          <div
            key={m.id + idx}
            className={cn(
              'w-full flex flex-col gap-2',
              m.role === 'user' ? 'items-end' : 'items-start'
            )}>
            {m.role !== 'data' && <NormalMessage m={m} />}
            {m.role === 'data' && <DataMessage m={m} editor={editor} />}
          </div>
        );
      })}

      {status === 'in_progress' &&
        (messages[messages.length - 1]?.role === 'user' ||
          !messages[messages.length - 1]?.content) && (
          <div className="h-8 w-full max-w-md p-2 mb-8 bg-gray-100 rounded-lg animate-pulse" />
        )}
    </div>
  );
};

export default AssistantChat;
