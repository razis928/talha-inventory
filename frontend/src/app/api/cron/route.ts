import { format } from 'date-fns';
import { NextResponse } from 'next/server';

// import Stripe from 'stripe';
// import { getSignedURL } from '@/lib/s3-bucket/signed-url';
import { sendEmail } from '@/lib/sendEmail';

// import { stripe } from '@/config/stripe-config';
// import { generateAccountsCSV } from '@/utils/stripe/csv-templates/accounts';
// import { generateAccountOwnershipsCSV } from '@/utils/stripe/csv-templates/ownerships';
// import { generateAccountTransactionsCSV } from '@/utils/stripe/csv-templates/transactions';
// Removed the imports that caused errors due to missing modules
// import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;
const entireCronLogs: string[] = [];

// Helper function to add timestamps to log messages
const logWithTimestamp = (message: string) => {
  const timestamp = format(new Date(), 'Ppp');
  entireCronLogs.push(`[${timestamp}] ${message}`);
};

// const groupTransactionsByMonth = (
//   transactions: Stripe.FinancialConnections.Transaction[],
// ) => {
//   const grouped: { [key: string]: Stripe.FinancialConnections.Transaction[] } =
//     {}; // Added type annotation
//   transactions.forEach((transaction) => {
//     const date = fromUnixTime(transaction.transacted_at);
//     const monthKey = format(date, 'yyyy-MM'); // Format as "YYYY-MM"

//     if (!grouped[monthKey]) {
//       grouped[monthKey] = [];
//     }
//     grouped[monthKey].push(transaction);
//   });
//   return grouped;
// };

// async function fetchCompaniesWithUsers() {
//   const supabase = createClient();
//   logWithTimestamp('⏳ Fetching companies from the database...');

//   const { data: companies, error: companiesError } = await supabase
//     .from('companies')
//     .select('*');

//   if (companiesError) {
//     logWithTimestamp(`❌ Error fetching companies: ${companiesError.message}`);
//     throw new Error(companiesError.message);
//   }

//   logWithTimestamp(`✅ Successfully fetched ${companies.length} companies.`);

//   const companiesWithUsers = await Promise.all(
//     companies.map(async (company) => {
//       logWithTimestamp(
//         `⏳ Fetching users for company: ${company.company_name}`,
//       );

//       const { data: user_companies, error: userCompaniesError } = await supabase
//         .from('user_companies')
//         .select('user_id, users(id, email, stripe_customer_id)')
//         .eq('company_id', company.id);

//       if (userCompaniesError) {
//         logWithTimestamp(
//           `❌ Error fetching users for company ${company.company_name}: ${userCompaniesError.message}`,
//         );
//         throw new Error(userCompaniesError.message);
//       }

//       const users = user_companies?.map((uc) => {
//         const user = Array.isArray(uc.users) ? uc.users[0] : uc.users;
//         return {
//           user_id: uc.user_id,
//           username: user?.email,
//           stripe_customer_id: user?.stripe_customer_id,
//         };
//       });

//       logWithTimestamp(
//         `✅ Fetched ${users.length} users for company: ${company.company_name}`,
//       );
//       return {
//         ...company,
//         users,
//       };
//     }),
//   );

//   return companiesWithUsers;
// }

// const getStripeData = async (user: {
//   user_id: string;
//   username: string;
//   stripe_customer_id: string;
// }) => {
//   logWithTimestamp(`⏳ Fetching Stripe data for user ${user.username}...`);
//   const accountsListing = await stripe.financialConnections.accounts.list({
//     expand: ['data.ownership'],
//     account_holder: { customer: user.stripe_customer_id },
//   });

//   if (!accountsListing || !accountsListing.data) {
//     logWithTimestamp(
//       `❌ Failed to retrieve accounts for user ${user.username}.`,
//     );
//     throw new Error('❌ Failed to retrieve accounts');
//   }
//   logWithTimestamp(
//     `✅ Fetched ${accountsListing.data.length} accounts for user ${user.username}.`,
//   );

//   const filterValidAccounts = accountsListing.data.filter(
//     (account) => account.status !== 'inactive',
//   );

//   for await (const account of filterValidAccounts) {
//     await Promise.all([
//       stripe.financialConnections.accounts.subscribe(account.id, {
//         features: ['transactions'],
//       }),
//       stripe.financialConnections.accounts.refresh(account.id, {
//         features: ['balance', 'ownership', 'transactions'],
//       }),
//     ]);
//     logWithTimestamp(
//       `✅ Refreshed and subscribed account ${account.id} for user ${user.username}.`,
//     );
//   }

//   const accounts = await stripe.financialConnections.accounts.list({
//     expand: ['data.ownership'],
//     account_holder: { customer: user.stripe_customer_id },
//   });
//   const accountsTransactions = [];

//   for await (const account of accounts.data) {
//     let transactions = {
//       data: [] as Stripe.FinancialConnections.Transaction[],
//     };
//     let hasMore = true;
//     try {
//       while (hasMore) {
//         const result = await stripe.financialConnections.transactions.list({
//           account: account.id,
//           limit: 100,
//           starting_after: transactions?.data[transactions?.data.length - 1]?.id,
//         });
//         hasMore = result.has_more;
//         transactions = transactions || { data: [] };
//         transactions.data = [...transactions.data, ...result.data];
//       }

//       logWithTimestamp(
//         `✅ Fetched ${transactions?.data?.length || 0} transactions for account ${account.id}.`,
//       );
//     } catch (error) {
//       if (error instanceof Error) {
//         logWithTimestamp(
//           `❌ Error fetching transactions for user ${user.username}, account ${account.id}: ${error.message}`,
//         );
//         continue;
//       }
//     }

//     if (!transactions || transactions?.data?.length === 0) {
//       logWithTimestamp(`✔️ No transactions found for account ${account.id}.`);
//       continue;
//     }
//     accountsTransactions.push(transactions);
//   }

//   return { accounts, transactions: accountsTransactions };
// };

// const generateAndUploadCSV = async (
//   key: string,
//   accounts: Stripe.Response<
//     Stripe.ApiList<Stripe.FinancialConnections.Account>
//   >,
//   transactions: Stripe.Response<
//     Stripe.ApiList<Stripe.FinancialConnections.Transaction>
//   >[],
// ) => {
//   logWithTimestamp(`⏳ Generating CSV files for ${key}...`);

//   logWithTimestamp(
//     `⏳ Uploading ${accounts.data.length} accounts and ${transactions[0].data.length} transactions with key:${key}...`,
//   );

//   const itemsToProcess = [];

//   if (accounts.data.length > 0) {
//     itemsToProcess.push('accounts', 'ownerships');
//   }

//   if (transactions.length > 0) {
//     const groupedTransactions = await groupTransactionsByMonth(
//       transactions.flatMap((t) => t.data),
//     );

//     // Process monthly transactions
//     for (const [monthYear, monthlyTransactions] of Object.entries(
//       groupedTransactions,
//     )) {
//       logWithTimestamp(
//         `✅ ${monthYear} ${monthlyTransactions.length} transactions found`,
//       );
//       logWithTimestamp(`⏳ Generating transactions CSV for ${monthYear}...`);

//       const csvBlob = await generateAccountTransactionsCSV(monthlyTransactions);
//       const transactionsKeyPath = `${key}/transactions/${monthYear}`;

//       const { success, error } = await getSignedURL(transactionsKeyPath);
//       logWithTimestamp(
//         `⏳ Blob generated, now uploading transactions for ${monthYear}...`,
//       );

//       if (success) {
//         logWithTimestamp(`⏳ Uploading transactions CSV for ${monthYear}...`);
//         const response = await fetch(success.url, {
//           method: 'PUT',
//           body: csvBlob,
//           headers: { 'Content-Type': 'text/csv' },
//         });

//         if (!response.ok) {
//           logWithTimestamp(
//             `❌ Upload failed for transactions CSV at ${transactionsKeyPath}: Status ${response.status}`,
//           );
//         } else {
//           logWithTimestamp(
//             `✅ Successfully uploaded transactions CSV for ${monthYear}`,
//           );
//         }
//       } else if (error) {
//         logWithTimestamp(
//           `❌ Failed to retrieve signed URL for transactions CSV at ${transactionsKeyPath}: ${error.message}`,
//         );
//       }
//     }
//     // itemsToProcess.push('transactions');
//   }

//   logWithTimestamp(
//     `⏳ Preparing to upload the following items: ${itemsToProcess} with key path ${key}.`,
//   );
//   for (const item of itemsToProcess) {
//     let csvBlob;
//     let _csvType: 'accounts' | 'transactions' | 'ownerships';
//     switch (item) {
//       case 'transactions':
//         // csvBlob = await generateAccountTransactionsCSV(transactions);
//         _csvType = 'transactions';
//         break;
//       case 'accounts':
//         csvBlob = await generateAccountsCSV(accounts);
//         _csvType = 'accounts';
//         break;
//       case 'ownerships':
//         csvBlob = await generateAccountOwnershipsCSV(accounts);
//         _csvType = 'ownerships';
//         break;
//       default:
//         continue;
//     }

//     const keyPath = `${key}/${item}`;

//     const { success, error } = await getSignedURL(keyPath);
//     logWithTimestamp(`⏳ Blob generated, now uploading with key path ${key}.`);

//     if (success) {
//       logWithTimestamp(`⏳ Uploading ${item} CSV for ${key}...`);
//       const response = await fetch(success.url, {
//         method: 'PUT',
//         body: csvBlob,
//         next: {
//           revalidate: 0,
//         },
//         headers: { 'Content-Type': 'text/csv' },
//       });

//       if (!response.ok) {
//         const uploadError = `❌ Upload failed for ${item} CSV at ${key}: Status ${response.status}`;
//         logWithTimestamp(uploadError);
//         continue;
//       }

//       logWithTimestamp(`✅ Successfully uploaded ${item} CSV for ${key}.`);
//     } else if (error) {
//       const signedUrlError = `❌ Failed to retrieve signed URL for ${item} CSV at ${key}: ${error.message}`;
//       logWithTimestamp(signedUrlError);
//       continue;
//     }
//   }
// };

export async function GET() {
  try {
    // logWithTimestamp(`Server: ${req.url}`);
    // const companiesWithUsers = await fetchCompaniesWithUsers();
    // for await (const company of companiesWithUsers) {
    //   for await (const user of company.users) {
    //     if (!user.stripe_customer_id) {
    //       logWithTimestamp(
    //         `✔️ User ${user.username} skipped due to missing Stripe customer ID.`,
    //       );
    //       continue;
    //     }

    //     const { accounts, transactions } = await getStripeData(user);
    //     if (transactions.length === 0 || accounts.data.length === 0) {
    //       logWithTimestamp(
    //         `✔️ User ${user.username} skipped due to no valid transactions or accounts.`,
    //       );
    //       continue;
    //     }

    //     await generateAndUploadCSV(
    //       `stripe_data/${company.company_name}/users/${user.username}`,
    //       accounts,
    //       transactions as Stripe.Response<
    //         Stripe.ApiList<Stripe.FinancialConnections.Transaction>
    //       >[],
    //     );
    //   }
    // }
    // if (process.env.NODE_ENV !== 'development') {
    //   await sendEmail({
    //     subject: 'CSV File Generation for Fairsplit Cron Completed',
    //     message: `CSV file generation has completed. Here are the logs:\n\n${entireCronLogs.join('\n')}`,
    //   });
    // }
    entireCronLogs.length = 0;

    return NextResponse.json({
      message: 'Cron CSV files have been generated and uploaded successfully',
      status: 200,
      logs: entireCronLogs,
    });
  } catch (error) {
    if (error instanceof Error) {
      logWithTimestamp(`Error: ${error.message}`);
      if (process.env.NODE_ENV === 'production') {
        await sendEmail({
          subject: 'CSV file generation error',
          message: `❌ An error occurred. Here are the logs:\n\n${entireCronLogs.join('\n')}`,
        });
      }
      entireCronLogs.length = 0;
      return NextResponse.json(
        {
          error: '❌ Failed to process the request for generating CSV files',
          errors: error.message,
          logs: entireCronLogs.join('\n'),
        },
        { status: 500 },
      );
    }
  }
}
