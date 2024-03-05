import { suggestion } from "./../api/tools/suggestion";
import { IInputConfigType } from "@/components/chat/MessageInput";
import { useCompletion } from "ai/react";
import { useState } from "react";

export const useAIComplete = ({
  type = "chat",
}: {
  type: "chat" | "assistant";
}) => {
  const [config, setConfig] = useState<IInputConfigType>(
    type === "assistant"
      ? {
          suggestion: true,
        }
      : {
          temperature: 0.5,
          suggestion: true,
        }
  );

  const { completion, complete } = useCompletion({
    api: "/api/completion/textarea",
  });

  return {
    config,
    setConfig,
    suggestions: completion.split("||"),
    complete: (e: string) => (config.suggestion ? complete(e) : null),
  };
};
