import Image from 'next/image';

export const vendorForm = [
  {
    id: 'company_name',
    label: 'Vendor Company Name',
    type: 'text',
    className: 'py-4 px-6',
    value: '',
  },
  {
    id: 'update_company_invoice',
    image: null,
    label: 'Upload Company Invoice',
    type: 'file',
    accept: '.svg,.png,.jpg,.gif',
    className:
      'w-[346px] h-[120px] flex items-center justify-center border border-custom-border rounded-lg p-4 relative',
    customContent: (
      <div className='text-center text-sm text-gray-600'>
        <Image
          src='/assets/vendors/addfile.svg'
          alt='Add Vendor Icon'
          width={41}
          height={41}
          className='m-auto'
        />
        <p className='font-poppins font-[10px]'>
          {' '}
          <b className='text-[black]'>Click to upload </b> or drag and drop
        </p>
        <p className='mt-1 font-poppins text-xs font-[10px]'>
          SVG, PNG, JPG, or GIF (max 800 x 400px)
        </p>
      </div>
    ),
  },
  {
    id: 'address_1',
    label: 'Address 1',
    type: 'text',
    value: '',
  },
  {
    id: 'address_2',
    label: 'Address 2',
    type: 'text',
    value: '',
  },
  {
    id: 'phone_number',
    label: 'Phone Number',
    type: 'number',
    value: '',
  },
  {
    id: 'email_address',
    label: 'Email Address',
    type: 'email',
    value: '',
  },
  {
    id: 'tax_id',
    label: 'Tax ID',
    type: 'text',
    value: '',
  },
];
