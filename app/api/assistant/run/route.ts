import { experimental_AssistantResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { MessageContentText } from "openai/resources/beta/threads/messages/messages";
import { setToolOutput } from "../../tools/utils";
import { throwError } from "@/app/utils/throwError";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: NextRequest) {
  // Parse the request body
  const input: {
    threadId?: string;
    assistantId: string;
    message: string;
    fileIds?: string[];
  } = await req.json();
  // Create a thread if needed
  const threadId = input.threadId ?? (await openai.beta.threads.create()).id;

  // Add a message to the thread
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: input.message,
    file_ids: input.fileIds,
  });
  try {
    return experimental_AssistantResponse(
      { threadId, messageId: createdMessage.id },
      async ({ threadId, sendMessage, sendDataMessage }) => {
        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: input.assistantId,
        });
        if (input.fileIds?.length) {
          sendDataMessage({
            role: "data",
            data: {
              type: "user_input",
              message: `上传了${input.fileIds.length}个文件`,
            },
          });
        }
        async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run) {
          // Poll for status change
          while (run.status === "queued" || run.status === "in_progress") {
            // delay for 500ms:
            await new Promise((resolve) => setTimeout(resolve, 500));

            run = await openai.beta.threads.runs.retrieve(threadId!, run.id);
          }

          // Check the run status
          if (
            run.status === "cancelled" ||
            run.status === "cancelling" ||
            run.status === "failed" ||
            run.status === "expired"
          ) {
            throw new Error(run.status);
          }

          if (
            run.status === "requires_action" &&
            run.required_action?.type === "submit_tool_outputs"
          ) {
            const tool_outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] =
              [];
            for (const toolCall of run.required_action.submit_tool_outputs
              .tool_calls) {
              try {
                await setToolOutput(
                  threadId,
                  toolCall,
                  tool_outputs,
                  sendDataMessage
                );
              } catch (e) {
                console.error("setToolOutput error:", e);
              }
            }
            run = await openai.beta.threads.runs.submitToolOutputs(
              threadId!,
              run.id,
              {
                tool_outputs,
              }
            );
            await waitForRun(run);
          }
        }

        await waitForRun(run);

        // Get new thread messages (after our message)
        const responseMessages = (
          await openai.beta.threads.messages.list(threadId, {
            after: createdMessage.id,
            order: "asc",
          })
        ).data;
        console.log("responseMessages:", responseMessages);
        // Send the messages
        for (const message of responseMessages) {
          sendMessage({
            id: message.id,
            role: "assistant",
            content: message.content.filter(
              (content) => content.type === "text"
            ) as Array<MessageContentText>,
          });
          if (
            message.content[0].type === "text" &&
            message.content[0].text.annotations
          ) {
            const annotations = message.content[0].text.annotations;
            sendDataMessage({
              role: "data",
              data: {
                type: "annotation_output",
                message: "生成了一些注释",
                annotations: annotations as any,
              },
            });
          }
        }
      }
    );
  } catch (error) {
    return throwError(error);
  }
}
