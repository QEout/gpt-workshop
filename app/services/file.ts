import OpenAI from "openai";
import { IRequest, request } from "./request";

export class FileService {
  constructor(private request: IRequest) {}
  public uploadImageAndGetDescription = (base64Image: string) => {
    return this.request("/api/file/upload_gpt4v", {
      body: { file: base64Image },
    });
  };

  public uploadFile = (file: File) => {
    const fileData = new FormData();
    fileData.append("file", file);
    return this.request<{ fileId: string }>("/api/file/upload", {
      body: fileData,
      headers: {},
    });
  };

  public deleteFile = (fileId: string) => {
    return this.request<boolean>("/api/file/deleteFile", {
      body: { fileId },
    });
  };

  public retrieveFile = (fileId: string) => {
    return this.request<OpenAI.FileObject>('/api/file/retrieveFile', {
      body: { fileId },
    });
  }

  public downloadFile = (fileId: string) => {
    return this.request<Blob>(`/api/file/download/${fileId}`);
  }

}

export const fileService = new FileService(request);