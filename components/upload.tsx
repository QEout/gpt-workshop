// my-app/app/GPT_Builder_components/Left_Side/Configure/Upload_Left/UploadFiles_2.tsx
import { prepareUploadFile, deleteUploadedFile } from '~/modules/fileModules';
import React, { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


// Define the structure of the file data
export interface FileData {
  name: string;
  fileId?: string;
  status?: 'uploading' | 'uploaded' | 'failed';
}

interface UploadFilesProps {
  files: FileData[];
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
}

const UploadFile: React.FC<UploadFilesProps> = ({ files, setFiles }) => {
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const originalFiles: File[] = Array.from(selectedFiles);
    originalFiles.forEach(file => {
      const fileData: FileData = { name: file.name, status: 'uploading' };
      setFiles(currentFiles => [...currentFiles, fileData]);

      prepareUploadFile(file, setStatusMessage)
        .then(fileId => {
          setFiles(currentFiles =>
            currentFiles.map(f =>
              f.name === fileData.name ? { ...f, fileId, status: 'uploaded' } : f
            )
          );
        })
        .catch(error => {
          console.error('Error uploading file:', error);
          setFiles(currentFiles =>
            currentFiles.map(f =>
              f.name === fileData.name ? { ...f, status: 'failed' } : f
            )
          );
        });
    });

    event.target.value = '';
  }, [setFiles]);

  const handleDelete = useCallback((fileId: string) => {
    const fileIndex = files.findIndex(f => f.fileId === fileId);
    if (fileIndex === -1) return;

    deleteUploadedFile(fileId, setStatusMessage)
      .then(() => {
        setFiles(currentFiles => currentFiles.filter(f => f.fileId !== fileId));
        setStatusMessage(`File deleted successfully.`);
      })
      .catch(error => {
        console.error('Error deleting file:', error);
        setStatusMessage(`Failed to delete file.`);
      });
  }, [files, setFiles]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <TooltipProvider>
      <div className="w-full flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="w-full rounded-lg p-2 relative">
              <div className="flex justify-between items-center ">
                <div className="flex items-center space-x-2 truncate">
                  <div className={`h-3 w-3 rounded-full  ${file.status === 'uploading' ? 'bg-orange-500' : file.fileId ? 'bg-green-500' : 'bg-red-500'}`}/>
                  <div className='truncate flex-1' title={file.name} >{file.name}</div>
                </div>
                {file.fileId && file.status === 'uploaded' && (
                  <div className="flex-1 ml-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className=''>
                        <DropdownMenuItem
                          onClick={() => file.fileId && navigator.clipboard.writeText(file.fileId)}
                        >
                          Copy file ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => file.fileId && handleDelete(file.fileId)}
                        >
                          Delete file
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div >
          <button
            className="bg-gray-200 text-gray-800 uppercase font-bold text-sm px-6 py-2 rounded shadow hover:bg-gray-300"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Upload files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UploadFile;
