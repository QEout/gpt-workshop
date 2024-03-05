import { ScrollArea } from "@/components/ui/scroll-area";
import ConfigureContent from './Configure/ConfigureContent';
import Link from "next/link";
import { useAssistantContext } from "../context/AssistantContext";
import { Button } from "@/components/ui/button";


const LeftPanel = () => {
  const { assistant } = useAssistantContext();
  return (
    <div className="w-1/2 h-screen overflow-y-auto  flex flex-col border-r border-gray-300">
      <div className="flex justify-between items-center mt-4 mx-4">
        <div className="flex gap-4 items-center">
          <Link href="/builder">
            <Button variant='outline' size='icon' >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5  h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </Button>
          </Link>
          <h1 className="font-semibold text-gray-400">{assistant?.id}</h1>
        </div>
        {/* 发布 */}
        {
          assistant?.id && (
            <Button variant="default" size="sm" onClick={() => {
              window.open(`/builder/stage/${assistant?.id}`, '_blank');
            }}>
              发布
            </Button>)
        }

      </div>
      <ScrollArea className="p-4">
        <ConfigureContent />
      </ScrollArea>
    </div>
  );
};

export default LeftPanel;