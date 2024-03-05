import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import Markdown from 'react-markdown';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Editor } from "@tiptap/core";
import { PauseIcon, Repeat2Icon } from "lucide-react";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import { FilePreview } from "./FilePreview";

const roleToColorMap: Record<Message['role'], string> = {
  system: 'red',
  user: 'black',
  function: 'blue',
  tool: 'purple',
  assistant: 'green',
  data: 'orange',
};

export type IMessageData = {
  type?: string;
  message?: string;
  function?: string;
  input?: string;
  output?: string;
  threadMessage?: IThreadMessage
}

export interface IChatMessage extends Omit<Message, 'data' | 'content'> {
  data?: IMessageData
  content: string;
}

export interface IThreadMessage extends Omit<IChatMessage, 'content'> {
  content?: ThreadMessage['content'] | string;
  created_at?: number;
  file_ids?: string[];
}

export const ThreadMessageContent = ({ content, isMarkdown = true }: { content: IThreadMessage['content'], isMarkdown?: boolean }) => {
  return !content ? null : (
    <div className={cn("w-fit prose max-w-full bg-gray-100 px-3 rounded-lg", {
      'whitespace-pre-wrap py-3': !isMarkdown,
    })}>
      {
        typeof content === 'string' ? content :
          <>
            {content.map((item, index) => {
              if (item.type === 'text' && item.text.annotations.length) {
                const annotations = item.text.annotations;
                return <div key={index} className='flex mt-3 flex-wrap gap-2'>
                  {annotations.map((annotation: any, index) => {
                    return <>
                      {annotation?.file_citation && (
                        <div className='text-sm text-gray-400'>
                          [{index}] {annotation?.file_citation.quote} from {annotation.file_citation.file_id}
                        </div>
                      )}
                      {annotation?.file_path && (
                        <div className='text-sm text-gray-400'>
                          Click <a href={'/api/file/download/' + annotation.file_path.file_id} download className='text-primary'>here</a> to download {annotation.file_path.file_id}
                        </div>
                      )}
                    </>
                  }
                  )}
                </div>
              }
              if (item.type === 'image_file') {
                return (
                  <FilePreview key={index} fileId={item.image_file.file_id} isImage />
                )
              }
              return isMarkdown ?
                <Markdown linkTarget="_blank" className='a-markdown'>
                  {item.text.value}
                </Markdown> :
                item.text.value
            }
            )}
          </>
      }
    </div>
  )
}

export const NormalMessage = ({ m }: { m: IThreadMessage }) => {
  return (
    <div className={cn('flex flex-col gap-2',
      m.role === 'user' ? 'items-end' : 'items-start'
    )}
    >
      <div className={cn('flex items-center gap-2', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
        <div className='rounded-full p-2 w-8 h-8 flex items-center justify-center text-white text-sm font-bold'
          style={{ backgroundColor: roleToColorMap[m.role] }}
          title={m.role}
          data-testid='role-indicator'
        >
          {m.role.slice(0, 1)}
        </div>
        <div className={cn('flex flex-col'
          , m.role === 'user' ? 'items-end' : 'items-start')}>
          <div className='text-sm text-gray-400'>{m.role}</div>
          {m.created_at && <div className='text-xs text-gray-300'>{format(new Date(m.created_at), 'MM-dd HH:mm:ss')}</div>}
        </div>
      </div>
      <ThreadMessageContent content={m.content} isMarkdown={m.role !== 'user'} />
      {
        m.file_ids?.length ? (
          <div className='flex gap-2'>
            {m.file_ids.map((fileId, index) => {
              return (
                <FilePreview key={index} fileId={fileId} />
              )
            })}
          </div>
        ) : null
      }
    </div>
  )
}

export const NormalChatMessage = ({ m, reload, stop, isLoading, isLast }: {
  m: IChatMessage,
  reload?: () => void,
  stop?: () => void
  isLoading?: boolean
  isLast?: boolean
}) => {
  return (
    <div className={cn("flex flex-col gap-2 group/msg",
      m.role === 'user' ? 'items-end' : 'items-start'
    )}>
      <div className={cn('flex items-center gap-2', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
        <div className='rounded-full p-2 w-8 h-8 flex items-center justify-center text-white text-sm font-bold'
          style={{ backgroundColor: roleToColorMap[m.role] }}
          title={m.role}
          data-testid='role-indicator'
        >
          {m.role.slice(0, 1)}
        </div>
        <div className={cn('flex flex-col',
          m.role === 'user' ? 'items-end' : 'items-start')}>
          <div className='text-sm text-gray-400'>{m.role}</div>
          {m.createdAt && <div className='text-xs text-gray-300'>{format(new Date(m.createdAt), 'MM-dd HH:mm:ss')}</div>}
        </div>
        {
          isLast && m.role === 'assistant' && (
            <Button variant='outline' size='xs' className="!py-0 !rounded-xl group/btn group-hover/msg:!flex hidden !w-fit items-center"
              onClick={() => {
                if (isLoading) {
                  stop?.()
                } else {
                  reload?.()
                }
              }}
            >
              {
                isLoading ? <PauseIcon className="h-4 w-4" /> : <Repeat2Icon className="h-4 w-4" />
              }
              {
                <div className="group-hover/btn:w-8 w-0 transition-all overflow-hidden">{
                  isLoading ? '停止' : '重试'
                }</div>
              }
            </Button>
          )
        }
      </div>
      {m.role === 'user' ?
        <div className="w-fit whitespace-pre-wrap max-w-full bg-gray-100 p-3 rounded-lg">
          {m.content}
        </div> :
        <Markdown linkTarget="_blank" className='a-markdown w-fit prose max-w-full bg-gray-100 p-3 rounded-lg'>
          {m.content}
        </Markdown>}
    </div>
  )
}

export const WritingMessage = ({ m, editor }: { m: IChatMessage, editor?: Editor | null }) => {
  const output = JSON.parse(m.data?.output ?? '[]') as {
    content: string
  }[]
  return (
    <div className='flex gap-2'>
      <div className='text-sm text-gray-600 cursor-pointer'>
        {m.data?.message}
      </div>
      <Popover>
        <PopoverTrigger>
          <div className='text-sm text-primary cursor-pointer'>
            预览
          </div>
        </PopoverTrigger>
        <PopoverContent align='start' className='bg-gray-100  border-gray-500 w-[400px]  break-words text-sm'>
          {
            output.map((item, index) => {
              return (
                <div key={index} className='flex flex-col gap-2'>
                  <Markdown linkTarget="_blank" className='a-markdown prose max-h-[400px] overflow-auto max-w-full bg-gray-100 p-3 rounded-lg'>
                    {item.content}
                  </Markdown>
                  {editor && (
                    <div className='flex gap-4 w-full justify-end'>
                      <Button variant='text' size='plain'
                        onClick={() => {
                          //找到prev_content并替换
                          const { from, to } = editor.state.selection;
                          editor.chain().focus().insertContentAt({ from, to }, item.content).run();
                        }}
                      >
                        替换
                      </Button>
                      <Button variant='text' size='plain'
                        onClick={() => {
                          const { to } = editor.state.selection;
                          editor.chain().focus().insertContentAt(to + 1, item.content).run();
                        }}>
                        插入
                      </Button>
                    </div>
                  )}
                </div>
              )
            })
          }
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const DataMessage = ({ m, editor }: { m: IChatMessage, editor?: Editor | null }) => {
  return (
    <>
      {m.data?.type === 'tool_call' && (
        <div className='text-sm text-gray-400'>
          {m.data?.message}
        </div>
      )}
      {m.data?.type === 'user_input' && (
        <div className='text-sm text-gray-400'>
          {m.data?.message}
        </div>
      )}
      {m.data?.type === 'tool_output' && m.data.function === 'writing_pro' &&
        <WritingMessage m={m} editor={editor} />
      }
      {
        m.data?.type === 'thread_message' && <NormalMessage m={m.data.threadMessage!} />
      }
      {m.data?.type === 'tool_output' && m.data.function !== 'writing_pro' &&
        <Popover>
          <PopoverTrigger>
            <div className='text-sm text-primary cursor-pointer'>
              {m.data?.message}
            </div>
          </PopoverTrigger>
          <PopoverContent align='start' className='bg-gray-100  border-gray-500  h-64 overflow-y-auto break-words text-sm'>
            <div className='flex flex-col gap-2'>
              <span>
                <span className='text-gray-400'>函数: </span>
                {m.data?.function}
              </span>
              <span>
                <span className='text-gray-400'>输入: </span>
                {m.data?.input}
              </span>
              <span>
                <span className='text-gray-400'>输出: </span>
                {m.data?.output}
              </span>
            </div>
          </PopoverContent>
        </Popover>}
    </>
  )
}

