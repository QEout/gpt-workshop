'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import MessageInput, { IInputConfigType } from '@/components/chat/MessageInput';
import { useChat, useCompletion } from 'ai/react';
import { useRequest } from 'ahooks';
import { chatAssistantService } from '@/app/services/chatAssistant';
import { cn } from '@/lib/utils';
import AIEditor, { IAIEditorRef } from "@/components/richtext/editor";
import { chatStageService } from '@/app/services/chatStage';
import toast from 'react-hot-toast';
import ChatAssistantChat from '@/components/chat/ChatAssistantChat';
import { useAIComplete } from '@/app/hooks/useAIComplete';
import { useRouter } from 'next/navigation';

const StagPage = (props: {
  params: { assistantId: string },
  searchParams: { threadId: string },
}) => {
  const assistantId = props.params.assistantId;
  const [steamReady, setStreamReady] = useState(false);
  const thId=props.searchParams.threadId;
  const router = useRouter();
  const { data: assistant } = useRequest(() => chatAssistantService.retrieveAssistant(assistantId), {
    ready: !!assistantId,
    refreshDeps: [assistantId]
  })
  const { complete, ...rest } = useAIComplete({ type: 'chat' });
  const { data: thread } = useRequest(() => chatAssistantService.updateThread({ assistantId, id: thId }), {
    ready: !!assistantId,
    refreshDeps: [assistantId]
  })
  const [content, setContent] = useState('');
  const { id, createdAt, updatedAt, ...assistantData } = assistant || {};
  const { data, messages, isLoading, input, reload, stop, handleSubmit, handleInputChange } = useChat({
    api: '/api/chatAssistant/run',
    id: thId,
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
      chatAssistantService.updateThread({
        assistantId: assistantId,
        messages: [...messages, res],
        id: thId
      })
    },
    onError: (err) => {
      setStreamReady(false);
      console.error(err);
      toast.error('发送消息失败');
    }
  });

  const { data: stage } = useRequest(() => chatStageService.retrieveStage(assistantId, thId), {
    ready: !!thId,
    refreshDeps: [assistantId, thId]
  })

  useEffect(() => {
    if (thread?.id&&thread.id !== thId) {
      
    router.push(`/builder-chat/stage/${assistantId}?threadId=${thread.id}`);
    }
  }, [thread?.id, assistantId, router, thId])

  useEffect(() => {
    if (stage && stage.content) {
      setContent(stage.content);
    }
  }, [stage])

  const showWriting = useMemo(() => assistant?.toolNames.includes('writing_pro') && stage
    , [assistant, stage]);

  const editorRef = useRef<IAIEditorRef>(null);

  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollTop = msgRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className='w-screen h-screen flex'>
      <div className={cn("h-screen p-8 pt-5 flex flex-col gap-6", showWriting ? 'w-1/2 pr-0' : 'w-full max-w-[1200px] mx-auto')}>
        <div className="flex items-center justify-between ">
          <span className=" font-semibold text-gray-400">
            {assistant?.name}
            &nbsp;
            <span className="text-gray-500 text-sm">
              {thId}
            </span>
          </span>
        </div>
        <div className='flex-1 pr-4 overflow-y-auto' ref={msgRef}>
          <ChatAssistantChat
            editor={editorRef.current?.getEditor()}
            messages={[...thread?.messages ?? [], ...messages]}
            isLoading={isLoading}
            steamReady={steamReady}
            reload={reload}
            stop={stop}
            data={data}
          />
        </div>
        <div className="w-full pr-4">
          <MessageInput
            input={input}
            handleInputChange={handleInputChange}
            submitMessages={handleSubmit}
            isLoading={isLoading}
            {...rest}
          />
        </div>
      </div>
      {showWriting &&
        <div className="w-1/2 h-screen p-8 pl-4 pt-5">
          <AIEditor stageId={stage?.id!}
            ref={editorRef}
            defaultContent={content}
          />
        </div>
      }
    </div>
  )
}


export default StagPage;