// MessageInput_Left.tsx
import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from "@/components/ui/button";
import UploadFiles, { FileData } from "@/components/upload";
import { PencilLineIcon, SettingsIcon, ThermometerIcon, UploadCloudIcon } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Switch } from '../ui/switch';

export interface IInputConfigType {
  temperature?: number;
  suggestion?: boolean;
}
export interface MessageInputProps {
  submitMessages: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  input: string;
  suggestions?: string[];
  config?: IInputConfigType;
  setConfig?: React.Dispatch<React.SetStateAction<IInputConfigType>>;
  files?: FileData[];
  setFiles?: React.Dispatch<React.SetStateAction<FileData[]>>;
  onSaveConfig?: () => void;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const maxHeight = 200;
const MessageInput: React.FC<MessageInputProps> = ({ files, setFiles, submitMessages, onSaveConfig, suggestions, config, setConfig, isLoading,
  input, handleInputChange }) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    //自动设置高度
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'; // Reset the height
      const computed = window.getComputedStyle(textAreaRef.current);
      // Calculate the height
      let height = textAreaRef.current.scrollHeight + parseInt(computed.borderTopWidth, 10) + parseInt(computed.borderBottomWidth, 10);

      // Check if the height exceeds the max-height
      if (maxHeight && height > maxHeight) {
        height = maxHeight;
        textAreaRef.current.style.overflowY = 'auto'; // Add scrollbar when exceeding max height
      } else {
        textAreaRef.current.style.overflowY = 'hidden'; // Hide scrollbar when not exceeding max height
      }

      textAreaRef.current.style.height = `${height}px`;
    }
  }, [input]);

  return (
    <TooltipProvider>
      <form onSubmit={submitMessages} className="flex flex-col items-center gap-2">
        {config?.suggestion && suggestions && suggestions?.length > 0 ? (
          <div className='flex flex-wrap gap-1 w-full justify-end'>
            {suggestions?.map((suggestion, index) => (
              <div key={index}
                className="cursor-pointer text-sm px-2 text-gray-500 rounded-lg p-1 bg-gray-100 hover:bg-gray-200"
                onClick={(e) => {
                  e.preventDefault();
                  handleInputChange({
                    target: {
                      value: suggestion,
                    } as any
                  } as any);
                }}>
                {suggestion}
              </div>
            ))}
          </div>) : null
        }
        <div className="w-full flex flex-col gap-1 items-end border border-input p-2 rounded-lg focus-within:outline-none focus-within:border-blue-500">
          <textarea
            ref={textAreaRef}
            className="outline-none w-full bg-white max-h-[200px] overflow-y-hidden resize-none"
            placeholder="Type your message here..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitMessages(e as any);
              }
              if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const value = e.currentTarget.value;
                const newValue = value.substring(0, start) + '\n' + value.substring(end);
                handleInputChange({
                  target: {
                    value: newValue,
                  } as any
                } as any);
              }
              }
            }
          />
          <div className="w-full justify-between items-center flex gap-2 ">
            <div className='flex items-center gap-1'>
              <Popover onOpenChange={(e) => {
                if (!e) {
                  onSaveConfig?.();
                }
              }}>
                <PopoverTrigger>
                  <div className='px-2 py-1 hover:bg-gray-100 rounded-md cursor-pointer'>
                  <SettingsIcon  size={20} />
                  </div>
                </PopoverTrigger>
                <PopoverContent align='start' className='rounded-lg flex flex-col gap-3 drop-shadow !w-56'>
                  {config?.temperature !== undefined &&
                    <MenuItem title='随机性'
                      icon={<ThermometerIcon size={20} />}
                      tooltip='对话生成的随机性，越大越随机'
                    >
                      <div className='flex-1 flex items-center gap-1 text-gray-500'>
                        <Slider
                          value={[config.temperature]}
                          onValueChange={(value) => {
                            setConfig?.((prev) => ({
                              ...prev,
                              temperature: value[0]
                            }));
                          }}
                          min={0}
                          step={0.1}
                          max={1}
                        />
                        <span>{config.temperature.toFixed(1)}</span>
                      </div>
                    </MenuItem>}
                  <MenuItem title='显示建议'
                    icon={<PencilLineIcon size={20} />}
                    tooltip='是否显示建议'
                  >
                    <Switch value={config?.suggestion}
                      onChange={(value) => {
                        setConfig?.((prev) => ({
                          ...prev,
                          suggestion: value
                        }));
                      }}
                    />
                  </MenuItem>
                </PopoverContent>
              </Popover>
              {/* 上传文件 */}
              {/* <Popover>
              <PopoverTrigger>
                < */}
              {files && setFiles && (
                <Popover>
                  <PopoverTrigger>
                    <div className="flex relative px-2 py-1 hover:bg-gray-100 rounded-md items-end gap-px cursor-pointer">
                      <UploadCloudIcon size={20} className='z-50' />
                      {
                        files.length >0?<div className='bg-blue-500 text-xs text-white h-4 px-1 leading-4 rounded-full'>{files.length}</div>:null
                      }
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align='start' className='rounded-lg flex flex-col gap-3 drop-shadow !w-72'>
                    <UploadFiles files={files} setFiles={setFiles} />
                  </PopoverContent>
                </Popover>
              )
              }
            </div>
            <div className='flex items-center gap-2'>
              <div className="flex items-center">
                <span className="text-xs text-gray-500">换行：</span>
                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <kbd className="px-2 rounded shadow">Shift</kbd>
                  +
                  <kbd className=" px-2 rounded shadow">Enter</kbd>
                </div>

              </div>

              <div className="flex items-center ">
                <span className="text-xs text-gray-500">
                  发送：
                </span>
                <kbd className="text-xs text-gray-500 rounded px-2 shadow">Enter</kbd>
              </div>

              <Button type="submit" variant="default" size='sm' className="ml-2 rounded" disabled={isLoading}>
                {isLoading ? '...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
};

export default MessageInput;


export const MenuItem = ({
  title,
  icon,
  tooltip,
  children
}: {
  title: React.ReactNode,
  icon?: React.ReactNode,
  tooltip: string,
  children: React.ReactNode
}) => {
  return (
    <div className="flex items-center gap-2">
      <Tooltip >
        <TooltipTrigger>
          <div className="flex items-center gap-1 w-24 text-gray-500">
            {icon}
            <span className='text-sm'>
              {title}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent align='start' >
          {tooltip}
        </TooltipContent>
      </Tooltip>
      {children}
    </div>
  )
}