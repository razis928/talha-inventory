import styles from '@/app/(financial_statements)/invoice/_components/styles';
export const headerData = ['Item', 'Quantity', 'Rate', 'Amount'];
export const payment = [
  {
    payment: 'Date',
    detail: 'Dec 1, 2023',
  },
  {
    payment: 'Payment Terms:',
    detail: 'Net 45',
  },
  {
    payment: 'Due Date',
    detail: 'Jan 15,2024',
  },
  {
    payment: 'Balance Due:',
    detail: '$1,725.00',
  },
  {
    payment: 'Balance Due:',
    detail: '$1,725.00',
  },
];
export const tableData = [
  {
    Item: 'Business + Monthly user lincense-August 2023',
    Quantity: '115',
    Rate: '$15.00',
    Amount: '$1,725.00',
  },
  {
    Item: '',
    Quantity: '',
    Rate: 'Subtotal:',
    Amount: '$1,725.00',
    styling: styles.color_black,
  },
  {
    Item: '',
    Quantity: '',
    Rate: 'Tax(0%):',
    Amount: '$0.00',
    styling: styles.color_black,
  },
  {
    Item: '',
    Quantity: '',
    Rate: 'Total:',
    Amount: '$1,725.00',
    styling: styles.color_black,
  },
];
