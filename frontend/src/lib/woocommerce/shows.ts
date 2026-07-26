import { APIConfig } from "@/config/api-config";
import { Show } from "@/types/woocommerce/Shows";

export async function getShows(
  route: "products" | "all-shows" | "all-hotels" | "all-tours"
): Promise<Show[]> {
  try {
    const { wooCommerce } = APIConfig;
    const params = new URLSearchParams({
      consumer_key: wooCommerce.consumer_key,
      consumer_secret: wooCommerce.consumer_secret,
      status: "publish",
      per_page: "20",
    });
    const response = await fetch(
      `${wooCommerce.baseURL}/${route}?${params.toString()}`
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching shows:", error);
    throw error;
  }
}
