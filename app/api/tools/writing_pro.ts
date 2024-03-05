// 自定义assitants api functions, 具有写作功能
export const writing_pro = {
  name: "writing_pro",
  // description: "具有写作功能，可以生成文章或者段落。同时也可以根据用户需求替换之前的内容。",
  description: "Has writing function, can generate articles or paragraphs. Also can replace previous content according to user's needs.",
  parameters: {
    type: "object",
    properties: {
      paragraphs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The content, in markdown format"
            },
          }
        }
      }
    },
    required: ["paragraphs"]
  },
};

export function writing_pro_api({paragraphs}:{paragraphs: Array<{index: number, title: string, content: string}>}) {
  try {
    return paragraphs;
  } catch (error) {
    console.error("Error get data from writing_pro_api", error);
  }
}

