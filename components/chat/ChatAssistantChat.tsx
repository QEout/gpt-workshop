import React, { useMemo } from 'react';
import { Message } from 'ai/react';
import { cn } from '@/lib/utils';
import { Editor } from '@tiptap/core';
import { DataMessage, IChatMessage, NormalChatMessage, NormalMessage, WritingMessage } from './MessageItem';


const ChatAssistantChat = (
  { editor, messages, data, steamReady, ...rest }: {
    messages: Message[], editor?: Editor | null,
    data?: any
    reload?: () => void
    stop?: () => void
    isLoading?: boolean
    steamReady?: boolean
  }
) => {
  // 对message和data按照createdAt排序并合并
  const sortedMessages = useMemo(() => {
    const temp = [...messages, ...(data ?? [])]
    temp.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    return temp
  }, [messages, data])

  return (
    <div className="flex flex-col w-full gap-4">
      {sortedMessages.map((message, idx) => {
        const m = message as IChatMessage;
        const isLast = message === messages[messages.length - 1];
        return (
          <div key={idx} className={cn('w-full flex flex-col gap-2',
            m.role === 'user' ? 'items-end' : 'items-start'
          )}>
            {m.role !== 'data' && <NormalChatMessage m={m}{...rest}isLast={isLast}/>}
            {m.role === 'data' && <DataMessage m={m} editor={editor} /> }
          </div>
        )
      })}
      {rest.isLoading && !steamReady &&
        (
          <div className="h-8 w-full max-w-md p-2 mb-8 bg-gray-100 rounded-lg animate-pulse" />
        )}

    </div>
  )
};

export default ChatAssistantChat;