import { CircleHelp } from 'lucide-react';
import React, { FC } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  text: string;
}
const CustomTooltip: FC<Props> = ({ text }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {' '}
          <CircleHelp className='ml-1' size={11} />
        </TooltipTrigger>
        <TooltipContent className='border-none bg-white'>
          <p className='text-xs'>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomTooltip;
