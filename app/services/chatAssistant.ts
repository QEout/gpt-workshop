import OpenAI from 'openai';
import {
  IUpdateChatAssistantInput,
  IUpdateChatThreadInput,
  WithObj,
} from '../types';
import { IRequest, request } from './request';
import { Message } from 'ai/react';

export type IChatAssistantType = WithObj<IUpdateChatAssistantInput>;

class ChatAssistantService {
  constructor(private request: IRequest) {}

  //retrieve assistant
  public retrieveAssistant = (id?: string) => {
    return this.request<IChatAssistantType>(
      '/api/chatAssistant/retrieveAssistant',
      { body: { id } }
    );
  };

  //查询助手列表
  public listAssistants = ({
    page = 1,
    limit = 100,
  }: {
    page?: number;
    limit?: number;
  }) => {
    return this.request<IChatAssistantType[]>('/api/chatAssistant/list', {
      body: { page, limit },
    });
  };

  public updateAssistant = (body: IUpdateChatAssistantInput) => {
    return this.request<IChatAssistantType>(
      '/api/chatAssistant/updateAssistant',
      {
        body,
      }
    );
  };

  public deleteAssistant = (id: string) => {
    return this.request<boolean>('/api/chatAssistant/deleteAssistant', {
      method: 'DELETE',
      body: { id },
    });
  };

  public updateThread = (body: {
    assistantId: string;
    messages?: Message[];
    id?: string;
  }) => {
    return this.request<IUpdateChatThreadInput>(
      '/api/chatAssistant/updateThread',
      {
        body,
      }
    );
  };

  public getTools = () => {
    return this.request<
      {
        name: string;
        description: string;
        alias: string;
      }[]
    >('/api/tools', { body: { type: 'chat' } });
  };
}

export const chatAssistantService = new ChatAssistantService(request);
