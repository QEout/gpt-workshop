import { AssistantResponse } from 'ai';
import OpenAI from 'openai';
import { setToolOutput } from '../../tools/utils';
import { throwError } from '@/app/utils/throwError';
import { azureOpenAI } from '../../utils/azureInstance';
import { MessageCreateParams } from 'openai/resources/beta/threads/messages.mjs';

export async function POST(req: Request) {
  // Parse the request body
  const input: {
    threadId?: string | null;
    message: string;
    assistantId: string;
    fileIds?: string[];
  } = await req.json();

  // Create a thread if needed
  const threadId =
    input.threadId ?? (await azureOpenAI.beta.threads.create({})).id;

  const newMessage: MessageCreateParams = {
    role: 'user',
    content: input.message,
  };
  if (input.fileIds) {
    newMessage.attachments = input.fileIds.map((fileId) => ({
      file_id: fileId,
      tools: [{ type: 'file_search' }],
    }));
  }
  console.log(newMessage);
  try {
    // Add a message to the thread
    const createdMessage = await azureOpenAI.beta.threads.messages.create(
      threadId,
      newMessage
    );

    return AssistantResponse(
      { threadId, messageId: createdMessage.id },
      async ({ forwardStream, sendDataMessage }) => {
        if (input.fileIds?.length) {
          sendDataMessage({
            role: 'data',
            data: {
              type: 'user_input',
              message: `上传了 ${input.fileIds.length} 个文件`,
            },
          });
        }
        // Run the assistant on the thread
        const runStream = azureOpenAI.beta.threads.runs.stream(threadId, {
          assistant_id:
            input.assistantId ??
            (() => {
              throw new Error('ASSISTANT_ID is not set');
            })(),
        });

        // forward run status would stream message deltas
        let runResult = await forwardStream(runStream);

        // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
        while (
          runResult?.status === 'requires_action' &&
          runResult.required_action?.type === 'submit_tool_outputs'
        ) {
          const tool_outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] =
            [];

          for (const toolCall of runResult.required_action.submit_tool_outputs
            .tool_calls) {
            console.log('toolCall:', toolCall);
            try {
              await setToolOutput(
                threadId,
                toolCall,
                tool_outputs,
                sendDataMessage
              );
            } catch (e) {
              console.error('setToolOutput error:', e);
            }
          }
          runResult = await forwardStream(
            azureOpenAI.beta.threads.runs.submitToolOutputsStream(
              threadId,
              runResult.id,
              { tool_outputs }
            )
          );
        }
      }
    );
  } catch (error) {
    console.error('Error in POST:', error);
    return throwError(error);
  }
}
