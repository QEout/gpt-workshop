"use client";

import { Command, CommandInput } from "../ui/command";

import { useCompletion } from "ai/react";
import { toast } from "sonner";
import { useEditor } from "../components";
import { useRef, useState } from "react";
import Markdown from "react-markdown";
import AISelectorCommands from "./ai-selector-commands";
import AICompletionCommands from "./ai-completion-command";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";

interface AISelectorProps {
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const [hasCompletion, setHasCompletion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/completion/editor",
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        return;
      }
      setHasCompletion(true);
      inputRef.current?.focus();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 text-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}
      <div className="relative">
        <CommandInput
          value={inputValue}
          onValueChange={setInputValue}
          autoFocus
          ref={inputRef}
          placeholder={
            hasCompletion
              ? "Tell AI what to do next"
              : "Ask AI to edit or generate..."
          }
          onFocus={() => {
            editor?.chain().setHighlight({ color: "#c1ecf970" }).run();
          }}
          onBlur={() => {
            editor?.chain().unsetHighlight().run();
          }}
        />
        {isLoading ?
          <div className="w-6 h-6 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          : <Button
            size="icon"
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 bg-primary"
            onClick={() => {
              if(!editor) return;
              if (completion)
                return complete(completion, {
                  body: { option: "zap", command: inputValue },
                }).then(() => setInputValue(""));

              const slice = editor.state.selection.content();
              const text = editor.storage.markdown.serializer.serialize(
                slice.content,
              );

              complete(text, {
                body: { option: "zap", command: inputValue },
              }).then(() => setInputValue(""));
            }}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>}
      </div>

      {!isLoading && (
        <>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor?.chain().unsetHighlight().focus().run();
                onOpenChange(false);
                setHasCompletion(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands
              onSelect={(value, option) =>
                complete(value, { body: { option } })
              }
            />
          )}
        </>
      )}
    </Command>
  );
}


