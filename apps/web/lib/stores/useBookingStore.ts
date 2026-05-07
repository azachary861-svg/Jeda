import { create } from 'zustand';

export interface BookingFormData {
  packageId: string | null;
  tripDate: Date | null;
  pickupTime: string;
  pickupLocation: string;
  paxCount: number;
  notes: string;
  addPhotographer: boolean;
}

export interface PriceBreakdown {
  basePrice: number;
  multiplier: number;
  subtotal: number;
  photographerFee: number;
  serviceFee: number;
  grandTotal: number;
  currency: string;
  appliedRule?: string;
}

interface BookingStoreState {
  // Form data
  formData: BookingFormData;
  priceBreakdown: PriceBreakdown | null;
  
  // UI state
  step: 'select-package' | 'select-date' | 'review' | 'payment';
  isCalculatingPrice: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;

  // Actions
  setFormData: (data: Partial<BookingFormData>) => void;
  setPriceBreakdown: (price: PriceBreakdown | null) => void;
  setStep: (step: BookingStoreState['step']) => void;
  setIsCalculatingPrice: (calculating: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  reset: () => void;
  getFormData: () => BookingFormData;
}

const initialFormData: BookingFormData = {
  packageId: null,
  tripDate: null,
  pickupTime: '08:00',
  pickupLocation: '',
  paxCount: 2,
  notes: '',
  addPhotographer: false,
};

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  formData: initialFormData,
  priceBreakdown: null,
  step: 'select-package',
  isCalculatingPrice: false,
  isSubmitting: false,
  error: null,
  success: false,

  setFormData: (data: Partial<BookingFormData>) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setPriceBreakdown: (price: PriceBreakdown | null) =>
    set({ priceBreakdown: price }),

  setStep: (step: BookingStoreState['step']) =>
    set({ step }),

  setIsCalculatingPrice: (calculating: boolean) =>
    set({ isCalculatingPrice: calculating }),

  setIsSubmitting: (submitting: boolean) =>
    set({ isSubmitting: submitting }),

  setError: (error: string | null) =>
    set({ error }),

  setSuccess: (success: boolean) =>
    set({ success }),

  reset: () =>
    set({
      formData: initialFormData,
      priceBreakdown: null,
      step: 'select-package',
      isCalculatingPrice: false,
      isSubmitting: false,
      error: null,
      success: false,
    }),

  getFormData: () =>
    get().formData,
}));
