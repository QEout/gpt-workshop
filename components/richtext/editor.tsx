"use client";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useDebounceFn } from "ahooks";
import './style.css'
import {
  defaultEditorProps,
  Editor,
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  IEditorCommandRef,
} from "./components";
import { ImageResizer } from "./extensions";
import { defaultExtensions } from "./extension";
import { Separator } from "./ui/separator";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { ColorSelector } from "./selectors/color-selector";

import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { chatStageService } from "@/app/services/chatStage";
import toast from "react-hot-toast";

const extensions = [...defaultExtensions, slashCommand];

export type IAIEditorRef = {
  getEditor: () => Editor | undefined | null;
};

export type IAIEditorProps = {
  defaultContent?: string;
  stageId: string;
};

const AIEditor = forwardRef<IAIEditorRef, IAIEditorProps>(({ defaultContent = '', stageId }, ref) => {
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const { run: debouncedUpdates } = useDebounceFn(async (editor: Editor) => {
    const markdown = editor.storage.markdown.serializer.serialize(editor.state.doc);
    try {
      await chatStageService.updateStage({ id: stageId, content: markdown });
      setSaveStatus("Saved");
    }
    catch (e) {
      toast.error("Failed to save");
      setSaveStatus("Failed to save");
    }
  }, { wait: 500 });
  const commandRef = useRef<IEditorCommandRef>(null);
  useImperativeHandle(ref, () => ({
    getEditor: () => commandRef.current?.getEditor(),
  }));

  return (
    <div className="relative h-full w-full max-w-screen-lg mx-auto">
      <div className="absolute right-4 top-4 z-10">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          {saveStatus}
        </div>
        {/* TODO:导出 */}

      </div>
      <EditorRoot>
        <EditorContent
          initialContent={defaultContent}
          extensions={extensions}
          className="relative h-full w-full  overflow-auto  border-muted bg-background  rounded-lg border shadow hover:shadow-lg"
          editorProps={{
            ...defaultEditorProps,
            attributes: {
              class: `prose-lg prose-stone dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand ref={commandRef} className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command?.(val)}
                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
});

AIEditor.displayName = "AIEditor";

export default AIEditor;