import { createClient } from '@/utils/supabase/client';

// Define the type for the task-status object
interface TaskStatusInput {
  task_category: string;
  title: string;
  description: string;
  task_status: string;
  user_id: string;
}

// Add task status to Supabase table
export const addTaskStatus = async (obj: TaskStatusInput): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('task_status').insert({
    task_category: obj.task_category,
    title: obj.title,
    description: obj.description,
    task_status: obj.task_status,
    completion_percentage: 0,
    user_id: obj.user_id,
  });

  if (error) {
    return;
  }
};
