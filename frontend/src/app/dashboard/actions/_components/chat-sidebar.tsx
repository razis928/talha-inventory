import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { getUserDetails, UserDetails } from '@/lib/supabase';

import { Input } from '@/components/ui/input';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/components/ui/use-toast';

import { agentConfig } from '@/config/agent-config';
import { createClient } from '@/utils/supabase/client';
import { addTaskStatus } from '@/utils/task-status';

function ChatSidebar() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatsMessages, setChatMessages] = useState<
    { message: string; messageType: 'user' | 'bot' }[]
  >([]);

  const agentResponse = async () => {
    try {
      const { financial_analysis_agent } = agentConfig;
      const params = new URLSearchParams({
        agent_id: financial_analysis_agent.agent_id,
        agent_alias_id: financial_analysis_agent.agent_alias_id,
        prompt,
      });
      const response = await fetch(`/api/bedrock?${params.toString()}`);
      const data = await response.json();

      // add task to task_status table to track history
      const supabase = createClient();
      const userDetails = (await getUserDetails(supabase)) as UserDetails;

      if (data?.error) {
        /// task is declined add to supabase
        addTaskStatus({
          task_category: 'finance',
          title: prompt,
          description: prompt,
          task_status: 'declined',
          user_id: userDetails.id,
        });

        return data.error;
      }

      /// task is approved add to supabase
      addTaskStatus({
        task_category: 'finance',
        title: prompt,
        description: prompt,
        task_status: 'approved',
        user_id: userDetails.id,
      });

      return data.data?.completion;
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const messageInput = (event.target as HTMLFormElement).message.value;
    setIsLoading(true);
    if (messageInput.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    setChatMessages((prev) => [
      ...prev,
      { message: messageInput, messageType: 'user' },
    ]);
    setPrompt('');
    const response = await agentResponse();

    setChatMessages((prev) => [
      ...prev,
      { message: response, messageType: 'bot' },
    ]);
    setIsLoading(false);
  };

  return (
    <SheetContent side='right' className='flex w-full flex-col sm:max-w-2xl'>
      <SheetHeader>
        <SheetTitle>Perform Tasks with AI</SheetTitle>
      </SheetHeader>
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='space-y-4'>
          {chatsMessages.map((message) => (
            <>
              {message.messageType === 'bot' ? (
                <div className='flex w-max max-w-[75%] flex-col gap-2 rounded-lg bg-white px-3 py-2 text-sm'>
                  {message.message}
                </div>
              ) : (
                <div className='ml-auto flex w-max max-w-[75%] flex-col gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground'>
                  {message.message}
                </div>
              )}
            </>
          ))}
        </div>
      </div>
      <div className='sticky bottom-0 bg-background p-6'>
        <form
          className='flex w-full items-center space-x-2'
          onSubmit={handleSubmit}
        >
          <Input
            className='flex h-9 w-full flex-1 rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
            id='message'
            name='message'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='What’s your task?'
            autoComplete='off'
          />
          <button
            className='inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width={24}
                  height={24}
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-send'
                >
                  <path d='m22 2-7 20-4-9-9-4Z' />
                  <path d='M22 2 11 13' />
                </svg>
                <span className='sr-only'>Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </SheetContent>
  );
}

export default ChatSidebar;
