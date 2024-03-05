'use client';
import { EditorBubble } from "../components";
import React, { Fragment, type ReactNode } from "react";
import { Button } from "../ui/button";
import { AISelector } from "./ai-selector";
import {Magic} from "../ui/icons";


interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const GenerativeMenuSwitch = ({
  children,
  open,
  onOpenChange,
}: GenerativeMenuSwitchProps) => {

  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl"
    >
      {open && <AISelector onOpenChange={onOpenChange} />}
      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500 hover:text-purple-500"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
