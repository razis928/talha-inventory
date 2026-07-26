export const APIConfig = {
  wooCommerce: {
    baseURL: process.env.WOOCOMMERCE_BASE_URL as string,
    consumer_key: process.env.WOOCOMMERCE_CONSUMER_KEY as string,
    consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET as string,
  },
};
