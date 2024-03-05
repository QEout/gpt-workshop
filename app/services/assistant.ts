import OpenAI from "openai";
import { IUpdateAssistantInput } from "../types";
import { IRequest, request } from "./request";
import { Message } from "ai/react";

class AssistantService {
  constructor(private request: IRequest) {}

  //retrieve assistant
  public retrieveAssistant = (id?: string) => {
    return this.request<OpenAI.Beta.Assistant>(
      "/api/assistant/retrieveAssistant",
      {
        body: { id },
      }
    );
  };

  //查询助手列表
  public listAssistants = () => {
    return this.request<OpenAI.Beta.Assistant[]>("/api/assistant/list");
  };

  public updateAssistant = (body: IUpdateAssistantInput) => {
    return this.request<OpenAI.Beta.Assistant>(
      "/api/assistant/updateAssistant",
      {
        body,
      }
    );
  };

  public deleteAssistant = (id: string) => {
    return this.request<boolean>("/api/assistant/deleteAssistant", {
      method: "DELETE",
      body: { id },
    });
  };

  public createThread = (inputmessage: string) => {
    return this.request<{ threadId: string }>("/api/assistant/createThread", {
      body: { inputmessage },
    });
  };

  public checkRunStatus = (threadId: string, runId: string) => {
    return this.request<{
      status: string;
    }>("/api/checkRunStatus", { body: { threadId, runId } });
  };

  public getThreadMessages = ({
    threadId,
    limit = 100,
  }: {
    threadId: string;
    limit?: number;
  }) => {
    return this.request<Message[]>("/api/assistant/getThreadMessages", {
      body: { threadId, limit },
    });
  };

  public getTools = () => {
    return this.request<{
        name: string;
        description: string;
        alias: string;
      }[]
    >("/api/tools", { body: { type: "assistant" } });
  };

  public getFileData = (fileIds?: string[]) => {
    return this.request<{
        bytes: number;
        created_at: string;
        filename: string;
        id: string;
        object: string;
        purpose: string;
        status: string;
      }[]
    >("/api/assistant/getFileData", {
      body: { fileIds },
    });
  };
}

export const assistantService = new AssistantService(request);
