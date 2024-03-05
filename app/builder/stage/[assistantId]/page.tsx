'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import AssistantChat from '@/components/chat/AssistantChat';
import MessageInput from '@/components/chat/MessageInput';
import {
  experimental_useAssistant as useAssistant, useCompletion,
} from 'ai/react';
import { useRequest } from 'ahooks';
import { assistantService } from '@/app/services/assistant';
import { cn } from '@/lib/utils';
import AIEditor, { IAIEditorRef } from "@/components/richtext/editor";
import { chatStageService } from '@/app/services/chatStage';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAIComplete } from '@/app/hooks/useAIComplete';
import { FileData } from '@/components/upload';

const StagPage = (props: {
  params: { assistantId: string },
  searchParams: { threadId: string },
}) => {
  const assistantId = props.params.assistantId;
  const thId = props.searchParams.threadId;
  const router=useRouter();
  const [threadFiles, setThreadFiles] = useState<FileData[]>([]);
  const { data: assistant } = useRequest(() => assistantService.retrieveAssistant(assistantId), {
    ready: !!assistantId,
    refreshDeps: [assistantId]
  })
  const [content, setContent] = useState('');


  const { status, messages, threadId, input, submitMessage, handleInputChange } = useAssistant({
    api: '/api/assistant/run',
    threadId: thId,
    body: {
      assistantId: assistantId,
      fileIds: threadFiles.map((file) => file.fileId),
    },
    onError: (err) => {
      console.error(err);
      toast.error('发送消息失败');
    },
  });

  const { data: initialMessages } = useRequest(() => assistantService.getThreadMessages({ threadId: thId }), {
    ready: !!thId&&!threadId,
  })
  const {complete,...rest}=useAIComplete({type: 'assistant'});
  const { data: stage } = useRequest(() => chatStageService.retrieveStage(assistantId, thId), {
    ready: !!thId,
    refreshDeps: [assistantId, thId]
  })

  useEffect(() => {
    if (threadId && threadId !== thId) {
      router.push(`/builder/stage/${assistantId}?threadId=${threadId}`);
    }
  }, [assistantId, router, thId, threadId])

  useEffect(() => {
    if (stage && stage.content) {
      setContent(stage.content);
    }
  }, [stage])

  const showWriting = useMemo(() =>
    assistant?.tools.find((tool) => tool.type === 'function' && tool.function.name === 'writing_pro') !== undefined 
    , [assistant]);

  const editorRef=useRef<IAIEditorRef>(null);

  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollTop = msgRef.current.scrollHeight;
    }
  }
    , [messages.length]);

    useEffect(() => {
      if(status === 'awaiting_message'){
        if(messages[messages.length - 1]?.role === 'assistant'){
          complete(messages[messages.length - 1].content);
        }
        setThreadFiles([]);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    console.log(messages)

  return (
    <div className='w-screen h-screen flex'>
      <div className={cn("h-screen p-8 pt-5 flex flex-col gap-6"
        , showWriting ? 'w-1/2 pr-0' : 'w-full max-w-[1200px] mx-auto'
      )}>
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
          <AssistantChat
            editor={editorRef.current?.getEditor()}
            messages={[...(initialMessages ?? []), ...messages]}
            status={status}
          />
        </div>
        <div className="w-full pr-4">
          <MessageInput
            input={input}
            handleInputChange={handleInputChange}
            submitMessages={submitMessage}
            isLoading={status !== "awaiting_message"}
            files={threadFiles}
            setFiles={setThreadFiles}
            {...rest}
          />
        </div>
      </div>
      { showWriting &&
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