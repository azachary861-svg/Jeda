import { useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBookingStore } from '@/lib/stores/useBookingStore';

/**
 * Fetch booking details with full data
 */
export function useBooking(bookingId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          package:packages(*),
          client:profiles!client_id(id, full_name, email, phone),
          driver:profiles!driver_id(id, full_name, phone, avatar_url),
          photographer:profiles!photographer_id(id, full_name),
          guide:profiles!guide_id(id, full_name),
          region:regions(id, name, slug)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });
}

/**
 * Fetch and calculate dynamic price for selected options
 */
export function useCalculatePrice() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (params: {
      packageId: string;
      tripDate: Date;
      paxCount: number;
      addPhotographer?: boolean;
    }) => {
      const { data, error } = await supabase.rpc('calculate_booking_price', {
        p_package_id: params.packageId,
        p_trip_date: params.tripDate.toISOString().split('T')[0],
        p_pax_count: params.paxCount,
        p_add_photographer: params.addPhotographer || false,
      });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Create new booking
 */
export function useCreateBooking() {
  const supabase = createClient();
  const bookingStore = useBookingStore();

  return useMutation({
    mutationFn: async (params: {
      packageId: string;
      tripDate: Date;
      pickupTime: string;
      pickupLocation: string;
      paxCount: number;
      notes?: string;
      addPhotographer: boolean;
      priceBreakdown: any;
      affiliateCode?: string;
    }) => {
      const user = (await supabase.auth.getUser()).data?.user;
      if (!user) throw new Error('Not authenticated');

      // Get package for region
      const { data: packageData } = await supabase
        .from('packages')
        .select('region_id')
        .eq('id', params.packageId)
        .single();

      if (!packageData) throw new Error('Package not found');

      // Create booking
      const { data, error } = await supabase.from('bookings').insert({
        client_id: user.id,
        package_id: params.packageId,
        region_id: packageData.region_id,
        trip_date: params.tripDate.toISOString().split('T')[0],
        pickup_time: params.pickupTime,
        pickup_location: params.pickupLocation,
        pax_count: params.paxCount,
        notes: params.notes,
        add_photographer: params.addPhotographer,
        base_price: params.priceBreakdown.basePrice,
        price_multiplier: params.priceBreakdown.multiplier,
        service_fee: params.priceBreakdown.serviceFee,
        photographer_fee: params.addPhotographer ? params.priceBreakdown.photographerFee : 0,
        total_price: params.priceBreakdown.subtotal,
        grand_total: params.priceBreakdown.grandTotal,
        currency: 'IDR',
        status: 'pending_payment',
        booking_source: 'web',
        affiliate_code: params.affiliateCode,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      bookingStore.reset();
    },
  });
}

/**
 * Update booking status (for admin)
 */
export function useUpdateBookingStatus() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (params: { bookingId: string; status: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: params.status })
        .eq('id', params.bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Cancel booking
 */
export function useCancelBooking() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (params: { bookingId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: params.reason,
        })
        .eq('id', params.bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch user's booking history
 */
export function useMyBookings() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data?.user;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          package:packages(name, slug, destination, cover_image_url),
          region:regions(name, slug)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
