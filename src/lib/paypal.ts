const PAYPAL_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get PayPal access token: ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function createPayPalOrder(
  amount: number,
  currency: string = "USD"
): Promise<{ id: string; approveUrl: string }> {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create PayPal order: ${text}`);
  }

  const data = await res.json();
  const approveLink = (data.links as Array<{ rel: string; href: string }>).find(
    (l) => l.rel === "approve"
  );

  return {
    id: data.id as string,
    approveUrl: approveLink?.href ?? "",
  };
}

export async function capturePayPalOrder(
  orderId: string
): Promise<{ status: string; captureId: string }> {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to capture PayPal order: ${text}`);
  }

  const data = await res.json();
  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? "";

  return {
    status: data.status as string,
    captureId,
  };
}
