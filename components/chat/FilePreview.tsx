import { fileService } from "@/app/services/file";
import { cn } from "@/lib/utils";
import { useRequest } from "ahooks";
import { DownloadIcon, FileIcon } from "lucide-react";
import Image from "next/image";

export const FilePreview = ({
  fileId,
  className,
  showIcon=true,
  isImage = false
}: {
  fileId: string,
  showIcon?: boolean,
  className?: string,
  isImage?: boolean
}) => {
  const { data: file } = useRequest(() => fileService.retrieveFile(fileId), {
    ready: !!fileId && !isImage
  });
  if (isImage) {
    return (
      <Image
        className={cn('mt-2 max-w-[500px] w-full', className)}
        src={`/api/file/download/${fileId}`}
        alt={file?.filename??'Image'}
      />
    );
  }
  return (
    <div className={cn("flex gap-1 items-center text-sm px-2 text-gray-500 rounded-sm", className)}>
      {showIcon&&<FileIcon size={16} />}
      <span>{file?.filename}</span>
      {file?.purpose !== 'assistants' && <a href={`/api/file/download/${fileId}`} download={file?.filename}>
        <DownloadIcon size={16} />
      </a>}
    </div>
  );
}