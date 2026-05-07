'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const paymentSchema = z.object({
  paymentMethod: z.enum(['midtrans', 'bank_transfer']),
  bankName: z.string().optional(),
  transferCode: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  currency?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: Error) => void;
}

type MidtransSnap = {
  pay: (
    token: string,
    options: {
      onSuccess?: (result: { transaction_id: string }) => void;
      onPending?: (result: unknown) => void;
      onError?: (result: unknown) => void;
      onClose?: () => void;
    },
  ) => void;
};

declare global {
  interface Window {
    snap?: MidtransSnap;
  }
}

/**
 * Payment form component untuk Midtrans + manual bank transfer
 * Integrates dengan Midtrans Snap UI dan handles Stripe fallback
 */
export function PaymentForm({
  bookingId,
  amount,
  currency = 'IDR',
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [midtransReady, setMidtransReady] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'midtrans',
    },
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (typeof window === 'undefined' || window.snap) {
      setMidtransReady(true);
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) return;

    const script = document.createElement('script');
    const useProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    script.src = useProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => setMidtransReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Mutation: Get Midtrans token
  const getMidtransToken = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/payment/midtrans/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Midtrans token');
      }

      const data = await response.json();
      return data.token;
    },
    onSuccess: (token) => {
      if (!window.snap) {
        handlePaymentError(new Error('Midtrans script belum siap'));
        return;
      }

      window.snap.pay(token, {
        onSuccess: (result: { transaction_id: string }) => {
          handlePaymentSuccess(result.transaction_id);
        },
        onPending: () => {
          onError?.(new Error('Pembayaran pending, tunggu konfirmasi webhook.'));
        },
        onError: () => {
          handlePaymentError(new Error('Payment failed'));
        },
      });
    },
    onError: (error) => {
      handlePaymentError(error as Error);
    },
  });

  // Mutation: Handle bank transfer verification
  const verifyBankTransfer = useMutation({
    mutationFn: async (params: { bankName: string; transferCode: string }) => {
      const response = await fetch('/api/payment/verify-bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          ...params,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify bank transfer');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      handlePaymentSuccess(data.transactionId);
    },
    onError: (error) => {
      handlePaymentError(error as Error);
    },
  });

  const handlePaymentSuccess = (transactionId: string) => {
    // Update booking status via API
    fetch(`/api/marketplace/booking/${bookingId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, paymentMethod }),
    })
      .then(async (response) => {
        const body = (await response.json()) as { success?: boolean; message?: string; error?: string };

        if (!response.ok || !body.success) {
          throw new Error(body.error ?? 'Gagal memperbarui status pembayaran');
        }

        if (response.status === 202) {
          setCheckoutMessage(body.message ?? 'Menunggu konfirmasi pembayaran dari gateway.');
          onSuccess?.(transactionId);
          return;
        }

        setCheckoutMessage(body.message ?? 'Pembayaran diproses.');
        onSuccess?.(transactionId);
      })
      .catch(onError);
  };

  const handlePaymentError = (error: Error) => {
    onError?.(error);
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      if (data.paymentMethod === 'midtrans') {
        if (!midtransReady) {
          throw new Error('Midtrans belum siap, coba beberapa detik lagi');
        }
        await getMidtransToken.mutateAsync();
      } else if (data.paymentMethod === 'bank_transfer') {
        if (!data.bankName || !data.transferCode) {
          throw new Error('Bank dan kode transfer wajib diisi');
        }

        await verifyBankTransfer.mutateAsync({
          bankName: data.bankName,
          transferCode: data.transferCode,
        });
      }
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Choose how you want to pay</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="midtrans"
                  {...register('paymentMethod')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">Credit Card / GCash / E-Wallet</p>
                  <p className="text-sm text-gray-500">Via Midtrans Snap - Instant</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="bank_transfer"
                  {...register('paymentMethod')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-gray-500">IDR only - Manual verification</p>
                </div>
              </label>
            </div>

            {paymentMethod === 'bank_transfer' && (
              <div className="grid gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Bank</label>
                  <input
                    {...register('bankName')}
                    placeholder="Contoh: BCA"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Kode Transfer / Referensi</label>
                  <input
                    {...register('transferCode')}
                    placeholder="TRF-123456"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                {errors.bankName?.message || errors.transferCode?.message ? (
                  <p className="text-xs text-red-600">
                    {errors.bankName?.message || errors.transferCode?.message}
                  </p>
                ) : null}
              </div>
            )}

            {/* Error Display */}
            {(getMidtransToken.isError || verifyBankTransfer.isError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getMidtransToken.error?.message || verifyBankTransfer.error?.message}
                </AlertDescription>
              </Alert>
            )}

            {checkoutMessage ? (
              <Alert>
                <AlertDescription>{checkoutMessage}</AlertDescription>
              </Alert>
            ) : null}

            {/* Amount Summary */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-2xl font-bold">
                    {amount.toLocaleString()} {currency}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || getMidtransToken.isPending || verifyBankTransfer.isPending}
            >
              {isSubmitting || getMidtransToken.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${amount.toLocaleString()} ${currency}`
              )}
            </Button>

            {/* Security Notice */}
            <p className="text-xs text-gray-500 text-center">
              💳 Secure payment processing powered by Midtrans & Stripe
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
