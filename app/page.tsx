// app/page.tsx
import React from 'react';
import Link from 'next/link';

const Page = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50 py-2">
      {/* css 背景图 类似网格向里旋转 */}
      <div className='absolute z-0 w-full bottom-0 left-0 h-full'
        style={{
          backgroundSize: '80px 80px',
          backgroundImage: `
            linear-gradient(to right, #ddd 1px, transparent 1px),
            linear-gradient(to bottom, #ddd 1px, transparent 1px)
          `,
          backgroundPosition: 'center center',
        }}
      />
      <div className='z-10 flex flex-col gap-16 items-center'>
      <div className="text-5xl font-bold">Welcome to Next Gpt Agents</div>
      <div className="text-xl font-semibold text-gray-600">Get started by creating a new assistant</div>
     <div className='flex flex-wrap gap-8'>
      <Link href="/builder">
        <div className="flex flex-col gap-2 items-center w-72 px-5 py-3 rounded-lg shadow-lg border hover:shadow-md hover:shadow-cyan-600 bg-gray-50">
          <div  className="text-xl font-bold text-cyan-600">
            Create Agent
          </div>
          <div className='font-semibold leading-8 text-gray-500'>
            ✔ by Assistants API <br />
            ✔ 自动管理对话状态<br />
            ✔ 丰富的工具支持<br />
            ✖ 无法流式生成
          </div>
        </div>
      </Link>
      <Link href="/builder-chat">
        <div className="flex flex-col gap-2 items-center w-72 px-5 py-3 rounded-lg shadow-lg border hover:shadow-md hover:shadow-purple-600 bg-gray-50">
          <div  className="text-xl font-bold text-purple-600">
            Create Chat Agent
          </div>
          <div className='font-semibold  leading-8 text-gray-500'>
            ✔ by GPT Chat <br />
            ✔ 完全自定义对话模型 <br />
            ✔ 流式生成对话 <br />
            ✖ 工具支持有限
          </div>
        </div>
      </Link>
      </div>
      </div>
    </div>
  );
};

export default Page;