//自定义assitants api functions,为用户的输入框提供快捷输入建议，例如当
// gpt 回答了用户问题，用户可以在输入框中选择一个建议继续追问

export const suggestion = {
  name: "suggestion",
  description: "Set suggestions for user input and gpt response.",
  parameters: {
    type: "object",
    properties: {
      suggestions: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    required: ["suggestions"],
  },
};

export function suggestion_api({ suggestions }: { suggestions: string[] }) {
  try {
    return suggestions;
  } catch (error) {
    console.error("Error get data from suggestion_api", error);
  }
}
