type MidtransPayload = {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: {
    first_name?: string;
    email?: string;
    phone?: string;
  };
};

type MidtransSnapResponse = {
  token: string;
  redirect_url: string;
};

export async function createMidtransTransaction(payload: MidtransPayload): Promise<MidtransSnapResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  if (!serverKey) {
    throw new Error('Missing MIDTRANS_SERVER_KEY');
  }

  const baseUrl = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Midtrans create transaction failed: ${body}`);
  }

  return (await response.json()) as MidtransSnapResponse;
}
