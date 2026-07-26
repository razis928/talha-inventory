export const triggerStripeCron = async () => {
  const res = await fetch('/api/cron');

  if (!res || !res.ok) {
    const errorMessage = res?.statusText || 'Failed to trigger Stripe cron';
    throw new Error(errorMessage);
  }
  return res.json();
};
