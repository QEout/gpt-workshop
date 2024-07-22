import { IRequest, request } from './request';
import { IUpdateWorkshopInput, WithObj } from '../types';

export type IWorkshopType = WithObj<IUpdateWorkshopInput>;

class WorkshopService {
  constructor(private request: IRequest) {}

  public updateWorkshop = (body: IUpdateWorkshopInput) => {
    return this.request<IWorkshopType>('/api/workshop/updateWorkshop', {
      body,
    });
  };

  public retrieveWorkshop = (assistantId: string, threadId: string) => {
    return this.request<IWorkshopType>('/api/workshop/retrieveWorkshop', {
      body: { assistantId, threadId },
    });
  };

  public deleteWorkshop = (id: string) => {
    return this.request<boolean>('/api/workshop/deleteWorkshop', {
      method: 'DELETE',
      body: { id },
    });
  };

  public getWorkshopList = (body: { page?: number; limit?: number }) => {
    return this.request<IWorkshopType[]>('/api/workshop/list', {
      body,
    });
  };
}

export const workshopService = new WorkshopService(request);
