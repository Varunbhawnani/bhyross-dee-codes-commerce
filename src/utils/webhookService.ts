
interface WebhookPayload {
  event: string;
  timestamp: string;
  user: {
    id: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
  };
  cartItem: {
    quantity: number;
    size: number;
  };
  message: string;
}

export const triggerCartWebhook = async (payload: WebhookPayload) => {
  const webhookUrl = "https://ai-agent12321.app.n8n.cloud/webhook-test/c2b5b284-409b-4ce7-b02f-f776eca4f298";
  
  console.log("Triggering cart webhook with payload:", payload);
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    console.log("Webhook triggered successfully");
    return true;
  } catch (error) {
    console.error("Failed to trigger webhook:", error);
    return false;
  }
};
