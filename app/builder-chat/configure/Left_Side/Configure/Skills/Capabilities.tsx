
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import UploadFiles, { FileData } from "@/components/upload";
import { IConfigureFormType } from '../type';
import { useRequest } from 'ahooks';
import { chatAssistantService } from '@/app/services/chatAssistant';

interface CapabilitiesProps {
  form: IConfigureFormType;
  files: FileData[];
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
}

const Capabilities = ({
  form,
  files,
  setFiles,
}: CapabilitiesProps) => {
  const { watch } = form;
  const watchKnowledgeRetrieval = watch('toolNames').includes('retrieval');
  const { data: tools } = useRequest(chatAssistantService.getTools)

  return (
    <div className="rounded-lg mx-2">
      <div>
        <h3 className="mt-6 mb-2">Capabilities</h3>
        <div className="space-y-4">
          {tools?.map((tool) => (
            <FormField
              key={tool.alias}
              control={form.control}
              name="toolNames"
              render={({ field }) => (
                <FormItem className="flex flex-col rounded-lg border border-input p-4 bg-card">
                  <div className="w-full justify-between items-center flex">
                    <div className="space-y-0.5">
                      <FormLabel >
                        {tool.name}
                      </FormLabel>
                      <FormDescription>
                        {tool.description}
                      </FormDescription>  </div>
                    <FormControl>
                      <Switch
                        value={field.value.includes(tool.alias)}
                        onChange={(e) => {
                          if (e) {
                            field.onChange([...field.value, tool.alias]);
                          } else {
                            field.onChange(field.value.filter((v) => v !== tool.alias));
                          }
                        }}
                      />
                    </FormControl>
                  </div>
                  {watchKnowledgeRetrieval && tool.alias === 'retrieval' &&
                    <UploadFiles files={files} setFiles={setFiles} />}
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Capabilities;