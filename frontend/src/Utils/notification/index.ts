import { CompanyDetails, UserCompanies } from '@/lib/supabase/company';

import { createClient } from '@/utils/supabase/client';

// Define the type for the notification object
interface NotificationInput {
  title: string;
  description: string;
  activity_page_url: string;
  user_id: string;
}

export const sendNotification = async (
  companyDetails: CompanyDetails | null,
  tab: 'paymentDetails' | 'companyInfo' | 'team',
) => {
  if (companyDetails === null) {
    return;
  }
  let validAccounts: UserCompanies[] = [];
  if (companyDetails?.notification_enabled) {
    validAccounts = companyDetails?.user_companies?.filter((userCompany) => {
      return userCompany.users.user_roles.some((userRole) => {
        return userRole.role === 'CFO' || userRole.role === 'CEO'; // Check for CFO and CEO roles
      });
    });
  }

  const emailTemplates = {
    paymentDetails: {
      subject: 'Payment method added',
      message: 'Payment method added successfully',
    },
    companyInfo: {
      subject: 'Company information updated',
      message: 'Company information updated successfully',
    },
    team: {
      subject: 'Team member added',
      message: 'Team member added successfully',
    },
  };
  try {
    const emailPromises = validAccounts?.map((account) => {
      return fetch(`/api/send-email`, {
        method: 'POST',
        body: JSON.stringify({
          subject: emailTemplates[tab].subject,
          message: emailTemplates[tab].message,
          to: account.users.email, // Assuming account.users has an email property
        }),
        headers: {
          'Content-Type': 'application/json', // Ensure the content type is set
        },
      });
    });
    await Promise.all(emailPromises);
  } catch (error) {
    return error;
  }
};

// Add notification to Supabase table
export const addNotification = async (
  obj: NotificationInput,
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('notification').insert({
    title: obj.title,
    description: obj.description,
    is_read: false, // Default value for is_read is false
    user_id: obj.user_id,
    activity_page_url: obj.activity_page_url,
    is_archived: false,
    is_favourite: false,
  });

  if (error) {
    return;
  }
};
