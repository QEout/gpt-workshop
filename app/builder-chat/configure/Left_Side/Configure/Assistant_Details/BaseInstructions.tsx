import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IConfigureFormType } from '../type';
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const BaseInstructions = ({ form }:
  { form: IConfigureFormType }
) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg  mx-2">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input

                id="name"
                placeholder="Name your GPT"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger >
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instructions</FormLabel>
            <FormControl>
              <Textarea
                id="instructions"
                {...field}
                placeholder="What does this GPT do? How does it behave? What should it avoid doing?"
              ></Textarea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BaseInstructions;