import { Message } from "ai/react";

export type WithObj<T> = T & { 
  id: string
  createdAt: Date
  updatedAt: Date
};

export type IUpdateAssistantInput = {
  id?: string;
  name: string;
  instructions: string;
  model: string;
  toolNames: string[];
  fileIds?: string[];
};

export type IUpdateChatStageInput = {
  id?: string;
  assistantId?: string;
  threadId?: string;
  content?:string
}

export type IUpdateChatAssistantInput = {
  id?: string;
  name: string;
  instructions: string;
  model: string;
  toolNames: string[];
  temperature?: number;
};

export type IUpdateChatThreadInput = {
  id?: string;
  assistantId: string;
  messages: Message[];
};

export type IUpdateWorkshopInput = {
  id?: string;
  name: string;
  description: string;
  members: string[];
};

export type IUpdateWorkshopProjectInput = {
  id?: string;
  name: string;
  description: string;
  workshopId: string;
};

