import Image from 'next/image';

const InsurancePage = async () => {
  return (
    <div className='bg-white px-[44px]'>
      <div className='flex flex-row items-center border-b border-[#00000012] py-[30px]'>
        <div className='h-[48px] w-[48px] rounded-full'>
          <Image
            src='/assets/insurance/logo2.svg'
            height={48}
            width={48}
            alt='insurance logo'
            className='h-[48px] w-[48px] rounded-full'
          />
        </div>
        <p className='pl-[42px] font-poppins text-[16px] text-[#3C3744]'>
          Health Insurance
        </p>
        <p className='pl-[70px] font-poppins text-[12px] text-[#3C3744A1]'>
          (Employee Benefits) Medical expenses{' '}
        </p>
      </div>
      <div className='flex flex-row items-center border-b border-[#00000012] py-[30px]'>
        <div className='h-[48px] w-[48px] rounded-full'>
          <Image
            src='/assets/insurance/logo3.svg'
            height={48}
            width={48}
            alt='insurance logo'
            className='h-[48px] w-[48px] rounded-full'
          />
        </div>
        <p className='pl-[42px] font-poppins text-[16px] text-[#3C3744]'>
          General Liability insurance{' '}
        </p>
        <p className='pl-[70px] font-poppins text-[12px] text-[#3C3744A1]'>
          (Covers claims of bodily injury){' '}
        </p>
      </div>
      <div className='flex flex-row items-center border-b border-[#00000012] py-[30px]'>
        <div className='flex h-[48px] w-[48px] flex-row items-center justify-center rounded-full bg-[#B0ADAD33]'>
          <Image
            src='/assets/insurance/briefcase.svg'
            height={24}
            width={24}
            alt='insurance logo'
            className='h-[24px] w-[24px] rounded-full'
          />
        </div>
        <p className='pl-[42px] font-poppins text-[16px] text-[#3C3744]'>
          Cyber Liability
        </p>
        <p className='pl-[70px] font-poppins text-[12px] text-[#3C3744A1]'>
          (Cyberattack ) Data breaches{' '}
        </p>
      </div>
      <div className='flex flex-row items-center border-b border-[#00000012] py-[30px]'>
        <div className='h-[48px] w-[48px] rounded-full'>
          <Image
            src='/assets/insurance/logo1.svg'
            height={48}
            width={48}
            alt='insurance logo'
            className='h-[48px] w-[48px] rounded-full'
          />
        </div>
        <p className='pl-[42px] font-poppins text-[16px] text-[#3C3744]'>
          Property Insurance
        </p>
        <p className='pl-[70px] font-poppins text-[12px] text-[#3C3744A1]'>
          Property damage{' '}
        </p>
      </div>
      <div className='flex flex-row items-center border-b border-[#00000012] py-[30px]'>
        <div className='flex h-[48px] w-[48px] flex-row items-center justify-center rounded-full bg-[#B0ADAD33]'>
          <Image
            src='/assets/insurance/briefcase.svg'
            height={24}
            width={24}
            alt='insurance logo'
            className='h-[24px] w-[24px] rounded-full'
          />
        </div>
        <p className='pl-[42px] font-poppins text-[16px] text-[#3C3744]'>
          Workers Compensation{' '}
        </p>
        <p className='pl-[70px] font-poppins text-[12px] text-[#3C3744A1]'>
          (Work-related injuries ) Medical expenses{' '}
        </p>
      </div>
    </div>
  );
};

export default InsurancePage;
