// import { NextResponse } from 'next/server';
// import puppeteer from 'puppeteer';

import { NextResponse } from 'next/server';

export async function GET() {
  //   // Define the HTML content directly within the route file with inline CSS
  //   const htmlContent = `
  //   <!DOCTYPE html>
  //   <html lang="en">
  //   <head>
  //     <meta charset="UTF-8" />
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //     <title>Invoice</title>
  //     <style>
  //       body {
  //         font-family: Arial, sans-serif;
  //         background-color: #ffffff;
  //         margin: 0;
  //         padding: 0;
  //       }
  //       .container {
  //         width: 90%;
  //         max-width: 800px;
  //         margin: 20px auto;
  //         padding: 20px;
  //         background-color: #ffffff;
  //         border-radius: 8px;
  //       }
  //       header {
  //         display: flex;
  //         justify-content: space-between;
  //         align-items: center;
  //         margin-bottom: 20px;
  //       }
  //       .logo {
  //         display: flex;
  //         align-items: center;
  //       }
  //       .logo img {
  //         width: 50px;
  //         height: 50px;
  //         margin-right: 10px;
  //       }
  //       .invoice-title {
  //         text-align: right;
  //       }
  //       .invoice-title h1 {
  //         font-size: 2rem;
  //         color: #2c3e50;
  //         margin: 0;
  //       }
  //       .invoice-title p {
  //         color: #7f8c8d;
  //         font-size: 0.9rem;
  //       }
  //       .invoice-info {
  //         display: flex;
  //         justify-content: space-between;
  //         margin-bottom: 20px;
  //       }
  //       .invoice-info div {
  //         width: 48%;
  //       }
  //       .invoice-info p {
  //         margin: 5px 0;
  //       }
  //       .balance-due {
  //         text-align: center;
  //         margin: 20px 0;
  //         padding: 10px;
  //         background-color: #e0e0e0;
  //         font-size: 1.2rem;
  //         color: #2c3e50;
  //         font-weight: bold;
  //       }
  //       .items {
  //         width: 100%;
  //         margin-bottom: 20px;
  //         border-collapse: collapse;
  //       }
  //       .items th,
  //       .items td {
  //         border: 1px solid #e0e0e0;
  //         padding: 10px;
  //         text-align: left;
  //       }
  //       .items th {
  //         background-color: #2c3e50;
  //         color: #ffffff;
  //       }
  //       .items td:first-child {
  //         width: 60%;
  //       }
  //       .total {
  //         text-align: right;
  //         margin-right: 20px;
  //         font-size: 1.2rem;
  //         color: #2c3e50;
  //       }
  //     </style>
  //   </head>
  //   <body>
  //     <div class="container">
  //       <header>
  //         <div class="logo">
  //           <img  src='assets/accounting-pdf/FairSplit.svg' alt="FairSplit Logo" />
  //           <div>
  //             <h2 style="margin: 0;">FairSplit</h2>
  //             <p style="margin: 0;">500 Howard street<br />San Francisco, CA 94105</p>
  //           </div>
  //         </div>
  //         <div class="invoice-title">
  //           <h1>INVOICE</h1>
  //           <p>#1223113</p>
  //         </div>
  //       </header>
  //       <div class="invoice-info">
  //         <div>
  //           <p><strong>Date:</strong> Dec 1, 2023</p>
  //           <p><strong>Payment Terms:</strong> Net 45</p>
  //           <p><strong>Due Date:</strong> Jan 15, 2024</p>
  //         </div>
  //         <div>
  //           <p><strong>Bill to:</strong></p>
  //           <p>Tesla<br />500 Howard street<br />San Francisco, CA 94105</p>
  //         </div>
  //       </div>
  //       <div class="balance-due">
  //         Balance Due: $1,725.00
  //       </div>
  //       <table class="items">
  //         <thead>
  //           <tr>
  //             <th>Item</th>
  //             <th>Quantity</th>
  //             <th>Rate</th>
  //             <th>Amount</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           <tr>
  //             <td>Business + Monthly user license - August 2023</td>
  //             <td>115</td>
  //             <td>$15.00</td>
  //             <td>$1,725.00</td>
  //           </tr>
  //         </tbody>
  //       </table>
  //       <div class="total">
  //         <p>Subtotal: $1,725.00</p>
  //         <p>Tax(0%): $0.00</p>
  //         <p><strong>Total: $1,725.00</strong></p>
  //       </div>
  //     </div>
  //   </body>
  //   </html>
  //   `;

  //   const browser = await puppeteer.launch();
  //   const page = await browser.newPage();

  //   // Set the content to the HTML string
  //   await page.setContent(htmlContent, { waitUntil: 'networkidle2' });

  //   // Generate PDF with styles
  //   const pdfBuffer = await page.pdf({
  //     format: 'A4',
  //     printBackground: true,
  //     margin: {
  //       top: '20px',
  //       right: '20px',
  //       bottom: '20px',
  //       left: '20px',
  //     },
  //   });

  //   await browser.close();

  //   return new NextResponse(pdfBuffer, {
  //     headers: {
  //       'Content-Type': 'application/pdf',
  //       'Content-Disposition': 'inline; filename=invoice.pdf',
  //     },
  //   });
  return NextResponse.json({ success: true });
}
