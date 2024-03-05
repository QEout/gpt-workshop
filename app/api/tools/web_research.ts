// 自定义assitants api functions,调用 tavily api 用于网页搜索
export const web_search = {
  name: "web_research",
  description: "Get information on recent events from the web.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        maxLength: 256,
        minLength: 5,
        description:
          "The search query to use. For example: 'Latest news on Nvidia stock performance'",
      },
    },
    required: ["query"],
  },
};

export async function web_research_api({query}:{query: string}) {
  // Call the web search API
  try {
    const results = await fetch('https://api.tavily.com/search',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        api_key: process.env.TAVILY_API_KEY,
        query 
      }),
    });
    const data = await results.json();
    // Return the results
    return data;
  } catch (error) {
    console.error("Error fetching data from the web search API", error);
  }
}
