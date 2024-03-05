import { IRequest, request } from "./request";
import { IUpdateChatStageInput, WithObj } from "../types";

export type IStageType = WithObj<IUpdateChatStageInput>;

class ChatStageService {
  constructor(private request: IRequest) {}

  public updateStage = ( body: IUpdateChatStageInput) => {
    return this.request<IStageType>("/api/chatStage/updateStage", {
      body,
    });
  };

  public retrieveStage = (assistantId: string, threadId: string) => {
    return this.request<IStageType>("/api/chatStage/retrieveStage", {
      body: { assistantId, threadId },
    });
  };

  public deleteStage = (id: string) => {
    return this.request<boolean>("/api/chatStage/deleteStage", {
      method: "DELETE",
      body: { id },
    });
  };
}

export const chatStageService = new ChatStageService(request);
