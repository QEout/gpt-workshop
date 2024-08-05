import { cn } from '@/lib/utils';
import { Message } from 'ai/react';
import Markdown from 'react-markdown';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Editor } from '@tiptap/core';
import { FilePreview } from './FilePreview';
import rehypeRaw from 'rehype-raw';
import { ThreadCreateParams } from 'openai/resources/beta/threads/threads';
import { MessageContentDelta } from 'openai/resources/beta/threads/messages.mjs';
import Image from 'next/image';

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
  threadMessage?: IThreadMessage;
};

export interface IChatMessage extends Omit<Message, 'data' | 'content'> {
  data?: IMessageData;
  content: MessageContentDelta[];
}

export interface IThreadMessage extends Omit<IChatMessage, 'content'> {
  content: MessageContentDelta[];
  created_at?: number;
  attachments?: ThreadCreateParams.Message['attachments'];
}

export const ThreadMessageContent = ({
  content,
}: {
  content: MessageContentDelta[];
}) => {
  return !content ? null : (
    <div className={cn('w-fit prose max-w-[90%] bg-gray-100 px-3 rounded-lg')}>
      {typeof content === 'string' ? (
        <Markdown linkTarget="_blank" className="a-markdown" key="markdown">
          {content}
        </Markdown>
      ) : (
        <>
          {content.map((item: MessageContentDelta, index) => {
            if (item.type === 'text' && item.text?.annotations?.length) {
              const annotations = item.text.annotations;
              const pureCitations = annotations.filter(
                (a) => a.type === 'file_citation'
              );
              const pureFilePaths = annotations.filter(
                (a) => a.type === 'file_path'
              );
              let markdownVal = item.text.value ?? '';
              // 把这个简历上的人名是曹伟力【8:0†source】。中的【8:0†source】去掉，用annotations 里的 file_citation 和 file_path 替换
              pureCitations.forEach((citation, idx) => {
                markdownVal = markdownVal?.replace(
                  citation?.text!,
                  `<sup>[[${idx}]](${
                    '/api/file/download/' + citation.file_citation?.file_id
                  })</sup>`
                );
              });

              return (
                <div key={'content' + index} className="flex flex-col">
                  <Markdown
                    linkTarget="_blank"
                    className="a-markdown"
                    rehypePlugins={[rehypeRaw]}
                    key="markdown1">
                    {markdownVal}
                  </Markdown>
                  <div className="flex flex-col gap-1">
                    {pureFilePaths.map((filePath, idx) => {
                      return (
                        <div key={'file_path' + idx} className="flex gap-1">
                          <span>{filePath.text}</span>
                          <a
                            href={
                              '/api/file/download/' +
                              filePath.file_path?.file_id
                            }
                            target="_blank"
                            className="text-blue-500 underline">
                            下载
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            if (item.type === 'image_file') {
              return (
                <FilePreview
                  key={index}
                  fileId={item.image_file?.file_id!}
                  isImage
                />
              );
            }
            if (item.type === 'image_url') {
              return (
                <Image
                  key={index}
                  src={item.image_url?.url!}
                  alt={item.image_url?.detail!}
                />
              );
            }
            return (
              <Markdown
                linkTarget="_blank"
                className="a-markdown"
                key="markdown2">
                {item.text?.value ?? ''}
              </Markdown>
            );
          })}
        </>
      )}
    </div>
  );
};

export const NormalMessage = ({ m }: { m: IThreadMessage }) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 w-full',
        m.role === 'user' ? 'items-end' : 'items-start'
      )}>
      <div
        className={cn(
          'flex items-center gap-2',
          m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
        )}>
        <div
          className="rounded-full p-2 w-8 h-8 flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: roleToColorMap[m.role] }}
          title={m.role}
          data-testid="role-indicator">
          {m.role.slice(0, 1)}
        </div>
        <div
          className={cn(
            'flex flex-col',
            m.role === 'user' ? 'items-end' : 'items-start'
          )}>
          <div className="text-sm text-gray-400">{m.role}</div>
          {m.created_at && (
            <div className="text-xs text-gray-300">
              {format(new Date(m.created_at * 1000), 'MM-dd HH:mm:ss')}
            </div>
          )}
        </div>
      </div>
      <ThreadMessageContent content={m.content} key={m.id} />
      {m.attachments?.length ? (
        <div className="flex gap-2">
          {m.attachments.map((file, index) => {
            return <FilePreview key={index} fileId={file.file_id!} />;
          })}
        </div>
      ) : null}
    </div>
  );
};

export const WritingMessage = ({
  m,
  editor,
}: {
  m: IChatMessage;
  editor?: Editor | null;
}) => {
  const output = JSON.parse(m.data?.output ?? '[]') as {
    content: string;
  }[];
  return (
    <div className="flex gap-2">
      <div className="text-sm text-gray-600 cursor-pointer">
        {m.data?.message}
      </div>
      <Popover>
        <PopoverTrigger>
          <div className="text-sm text-primary cursor-pointer">预览</div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="max-h-[500px] overflow-auto bg-gray-100  border-gray-500 w-[400px]  break-words text-sm">
          {output.map((item, index) => {
            return (
              <div key={index} className="flex flex-col gap-2">
                <Markdown
                  linkTarget="_blank"
                  className="a-markdown prose max-h-[400px] overflow-auto max-w-full bg-gray-100 p-3 rounded-lg">
                  {item.content}
                </Markdown>
                {editor && (
                  <div className="flex gap-4 w-full justify-end">
                    <Button
                      variant="text"
                      size="plain"
                      onClick={() => {
                        //找到prev_content并替换
                        const { from, to } = editor.state.selection;
                        editor
                          .chain()
                          .focus()
                          .insertContentAt({ from, to }, item.content)
                          .run();
                      }}>
                      替换
                    </Button>
                    <Button
                      variant="text"
                      size="plain"
                      onClick={() => {
                        const { to } = editor.state.selection;
                        editor
                          .chain()
                          .focus()
                          .insertContentAt(to + 1, item.content)
                          .run();
                      }}>
                      插入
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const DataMessage = ({
  m,
  editor,
}: {
  m: IChatMessage;
  editor?: Editor | null;
}) => {
  return (
    <>
      {m.data?.type === 'tool_call' && (
        <div className="text-sm text-gray-400">{m.data?.message}</div>
      )}
      {m.data?.type === 'user_input' && (
        <div className="text-sm text-gray-400">{m.data?.message}</div>
      )}
      {m.data?.type === 'tool_output' && m.data.function === 'writing_pro' && (
        <WritingMessage m={m} editor={editor} />
      )}
      {m.data?.type === 'thread_message' && (
        <NormalMessage m={m.data.threadMessage!} />
      )}
      {m.data?.type === 'tool_output' && m.data.function !== 'writing_pro' && (
        <Popover>
          <PopoverTrigger>
            <div className="text-sm text-primary cursor-pointer">
              {m.data?.message}
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="bg-gray-100  border-gray-500  h-64 overflow-y-auto break-words text-sm">
            <div className="flex flex-col gap-2">
              <span>
                <span className="text-gray-400">函数: </span>
                {m.data?.function}
              </span>
              <span>
                <span className="text-gray-400">输入: </span>
                {m.data?.input}
              </span>
              <span>
                <span className="text-gray-400">输出: </span>
                {m.data?.output}
              </span>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};
