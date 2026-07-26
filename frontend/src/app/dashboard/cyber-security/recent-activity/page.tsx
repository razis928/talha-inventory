import Image from 'next/image';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Reusable Accordion Item Component
const ActivityAccordionItem = ({
  title,
  time,
  description,
  iconSrc,
  value,
}: {
  title: string;
  time: string;
  description: string;
  iconSrc: string;
  value: string;
}) => (
  <AccordionItem className='AccordionItem' value={value}>
    <AccordionTrigger>
      <div className='flex flex-row items-center'>
        <div className='flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#B0ADAD33]'>
          <Image src={iconSrc} height={24} width={24} alt='activity-logo' />
        </div>
        <div className='ml-[24px] flex flex-col text-start'>
          <p className='font-poppins text-[14.5px] font-medium leading-[21.75px] tracking-[-0.375px] text-[#3C3744]'>
            {title}
          </p>
          <p className='font-poppins text-[10px] font-normal tracking-[-0.375px] text-[#3C3744]'>
            {time} ago
          </p>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent>{description}</AccordionContent>
  </AccordionItem>
);

const RecentActivity = () => {
  return (
    <div className='recent-activity-page mt-5'>
      <div className='flex w-full flex-col justify-between lg:flex-row'>
        {/* Header Section */}
        <div className='mb-5 flex h-[60px] w-full flex-row items-center justify-between rounded-[10px] bg-white px-[12px] lg:mb-0 lg:w-[25%]'>
          <p className='font-poppins text-[14.5px] font-medium leading-[21.75px] tracking-[-0.375px] text-[#3C3744]'>
            Threat Activity (24)
          </p>
          <Image
            src='/assets/cyber-security/logo1.svg'
            height={36}
            width={36}
            alt='threat-logo'
          />
        </div>

        {/* Accordion Section */}
        <div className='max-h-[373px] w-full rounded-[10px] bg-white px-[30px] py-[20px] lg:w-[70%]'>
          <p className='mb-[20px] font-poppins text-[14.5px] font-medium leading-[21.75px] tracking-[-0.375px] text-[#3C3744]'>
            Recent Activity
          </p>

          <Accordion
            className='AccordionRoot'
            type='single'
            defaultValue='item-1'
            collapsible
          >
            {/* Use the reusable ActivityAccordionItem for each item */}
            <ActivityAccordionItem
              value='1'
              title='Firewall rules updated'
              time='5 minutes'
              description='Yes. It adheres to the WAI-ARIA design pattern.'
              iconSrc='/assets/cyber-security/briefcase.svg'
            />
            <ActivityAccordionItem
              value='2'
              title='Malware detected and quarantined'
              time='7 minutes'
              description='Here is the description.'
              iconSrc='/assets/cyber-security/briefcase.svg'
            />
            <ActivityAccordionItem
              value='3'
              title='New user accounts created'
              time='8 minutes'
              description='Here is the description.'
              iconSrc='/assets/cyber-security/briefcase.svg'
            />
            <ActivityAccordionItem
              value='4'
              title='System backup completed'
              time='15 minutes'
              description='Here is the description.'
              iconSrc='/assets/cyber-security/briefcase.svg'
            />
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
