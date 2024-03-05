"use client"
import { useRequest } from 'ahooks';
import { assistantService } from '../services/assistant';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';

const BuilderPage = () => {
  // 查询助手列表
  const { data: assistantList,loading, refresh } = useRequest(assistantService.listAssistants);
  const router = useRouter();
  return (
    <div className='py-8 font-sans h-screen w-screen overflow-y-auto'>
      <div className="p-2 text-center space-y-2">
        <h1 className='text-2xl'>
          BuilderPage
        </h1>
        <p>
          This is a page that uses the assistantService to get a list of helpers.
        </p>
      </div>
      <div className='flex flex-col gap-4 mx-auto px-2 max-w-[600px]'>
        {/* create a new assistant */}
        <Button 
          onClick={() => {
            router.push('/builder/configure')
          }}
        >Create a new assistant</Button>
        {
          assistantList?.map((item, index) => {
            return (
              <div key={index} className='bg-gray-100 p-4 rounded-md flex flex-col gap-2'
              >
                <div className='flex justify-between items-center'>
                  <div>
                    <h2 className='text-xl'>{item.name}</h2>
                    <div className='text-gray-400 text-sm'>
                      {item.id}
                    </div>  
                    </div>
                    <div className='flex gap-2'>
                      {/* 查看详情、删除 */}
                      <Button
                      size={'xs'}
                        onClick={() => {
                          router.push(`/builder/configure/${item.id}`)
                        }}
                      >View details</Button>
                      <Button
                      size={'xs'}
                      variant={'destructive'}
                      
                        onClick={() => {
                          assistantService.deleteAssistant(item.id).then(() => {
                            toast.success('Delete successfully')
                            refresh()
                          })
                        }}
                      >
                        <Trash2Icon size={16} />
                      </Button>
                    </div>
                
                </div>
                <p className='text-gray-600 text-sm line-clamp-3'>{item.instructions}</p>
                <div className='flex justify-between items-end'>
                  {/* 能力 */}
                  <div className='flex gap-2 flex-1 flex-wrap text-sm'>
                    {
                      item.tools.map((tool, index) => {
                        const name = tool.type === 'function' ? tool.function.name : tool.type
                        return (
                          <span key={index} className='px-2 py-1 rounded-md bg-gray-200'>{name}</span>
                        )
                      }
                      )}
                  </div>
                  <span className='text-gray-400 text-sm'>
                    {format(item.created_at * 1000, 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                </div>
              </div>
            )
          })
        }
                {
          loading && 
          <div className="h-16 w-full p-2 mb-8 bg-gray-100 rounded-lg animate-pulse" />
        }
      </div>

    </div>
  );
}

export default BuilderPage;