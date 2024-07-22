import { AssistantResponse, experimental_AssistantResponse } from 'ai';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { setToolOutput } from '../../tools/utils';
import { throwError } from '@/app/utils/throwError';
import { azureOpenAI } from '../../utils/azureInstance';
import { writing_pro_api } from '../../tools/writing_pro';
import { MessageCreateParams } from 'openai/resources/beta/threads/messages.mjs';

// export async function POST(req: NextRequest) {
//   // Parse the request body
//   const input: {
//     threadId?: string;
//     assistantId: string;
//     message: string;
//     fileIds?: string[];
//   } = await req.json();
//   // Create a thread if needed
//   const threadId = input.threadId ?? (await azureOpenAI.beta.threads.create()).id;

//   // Add a message to the thread
//   const createdMessage = await azureOpenAI.beta.threads.messages.create(threadId, {
//     role: 'user',
//     content: input.message,
//   });
//   try {
//     return experimental_AssistantResponse(
//       { threadId, messageId: createdMessage.id },
//       async ({ threadId, sendMessage, sendDataMessage }) => {
//         // Run the assistant on the thread
//         const run = await azureOpenAI.beta.threads.runs.create(threadId, {
//           assistant_id: input.assistantId,
//         });
//         if (input.fileIds?.length) {
//           sendDataMessage({
//             role: 'data',
//             data: {
//               type: 'user_input',
//               message: `上传了${input.fileIds.length}个文件`,
//             },
//           });
//         }
//         async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run) {
//           // Poll for status change
//           while (run.status === 'queued' || run.status === 'in_progress') {
//             // delay for 500ms:
//             await new Promise((resolve) => setTimeout(resolve, 500));

//             run = await azureOpenAI.beta.threads.runs.retrieve(threadId!, run.id);
//           }

//           // Check the run status
//           if (
//             run.status === 'cancelled' ||
//             run.status === 'cancelling' ||
//             run.status === 'failed' ||
//             run.status === 'expired'
//           ) {
//             throw new Error(run.status);
//           }

//           if (
//             run.status === 'requires_action' &&
//             run.required_action?.type === 'submit_tool_outputs'
//           ) {
//             const tool_outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] =
//               [];
//             for (const toolCall of run.required_action.submit_tool_outputs
//               .tool_calls) {
//               try {
//                 await setToolOutput(
//                   threadId,
//                   toolCall,
//                   tool_outputs,
//                   sendDataMessage
//                 );
//               } catch (e) {
//                 console.error('setToolOutput error:', e);
//               }
//             }
//             run = await azureOpenAI.beta.threads.runs.submitToolOutputs(
//               threadId!,
//               run.id,
//               {
//                 tool_outputs,
//               }
//             );
//             await waitForRun(run);
//           }
//         }

//         await waitForRun(run);

//         // Get new thread messages (after our message)
//         const responseMessages = (
//           await azureOpenAI.beta.threads.messages.list(threadId, {
//             after: createdMessage.id,
//             order: 'asc',
//           })
//         ).data;
//         for (const message of responseMessages) {
//           sendDataMessage({
//             role: 'data',
//             data: {
//               type: 'thread_message',
//               threadMessage: message,
//             } as any,
//           });
//         }
//       }
//     );
//   } catch (error) {
//     return throwError(error);
//   }
// }

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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
          // runResult.required_action.submit_tool_outputs.tool_calls.map(
          //   (toolCall) => {
          //     const parameters = JSON.parse(toolCall.function.arguments);

          // switch (toolCall.function.name) {
          //   case 'writing_pro': {
          //     sendDataMessage({
          //       role: 'data',
          //       data: {
          //         type: 'tool_call',
          //         message: `📝正在写作...`,
          //       },
          //     });
          //     const output = writing_pro_api(parameters);
          //     if (process.env.DEBUG === 'True') {
          //       sendDataMessage({
          //         role: 'data',
          //         data: {
          //           type: 'tool_output',
          //           message: '✨生成了写作内容',
          //           function: toolCall.function.name,
          //           output: JSON.stringify(output),
          //         },
          //       });
          //     }
          //     return {
          //       tool_call_id: toolCall.id,
          //       output: 'success for writing',
          //     };
          //   }

          //   default:
          //     console.error(
          //       `Unknown tool call function: ${toolCall.function.name}`
          //     );
          //     throw new Error(
          //       `Unknown tool call function: ${toolCall.function.name}`
          //     );
          // }

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
