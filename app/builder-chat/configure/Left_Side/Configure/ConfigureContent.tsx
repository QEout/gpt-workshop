
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import BaseInstructions from './Assistant_Details/BaseInstructions';
import Capabilities from './Skills/Capabilities';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from './type';
import { useAssistantContext } from '../../context/AssistantContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { chatAssistantService } from '@/app/services/chatAssistant';
import { FileData } from '@/components/upload';


const ConfigureContent = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const { assistant, refresh } = useAssistantContext();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      instructions: '',
      model: 'gpt-3.5-turbo',
      toolNames: [] as string[],
    },
  });

  useEffect(() => {
    if (!assistant) return;
    form.reset({
      name: assistant?.name || '',
      instructions: assistant?.instructions || '',
      model: assistant?.model || 'gpt-3.5-turbo',
      toolNames: assistant?.toolNames || [],
    });
  }, [assistant,form]);

  return (
    <FormProvider {...form}>
      {/* 提交 */}
      <form onSubmit={
        async (e) => {
          e.preventDefault();
          if (await form.trigger()) {
            chatAssistantService.updateAssistant({
              ...form.getValues(),
              id: assistant?.id,
            }).then((res) => {
              refresh?.();
              if (assistant) {
                toast.success('Update successfully');
              } else {
                router.push(`/builder-chat/configure/${res.id}`);
              }
            })
          }
        }
      }>
        <BaseInstructions form={form} /> {/* Pass the props here */}
        <Capabilities
          form={form}
          files={files}
          setFiles={setFiles}
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" className="bg-blue-600 text-white">
            {assistant ? 'Update Assistant' : 'Create Assistant'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ConfigureContent;