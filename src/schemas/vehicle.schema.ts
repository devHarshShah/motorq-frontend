import { z } from 'zod';

export const vehicleFormSchema = z.object({
  numberPlate: z.string()
    .min(1, 'Number plate is required')
    .max(20, 'Number plate must be less than 20 characters')
    .regex(/^[A-Z0-9\s-]+$/, 'Number plate must contain only letters, numbers, spaces, and hyphens'),
  
  type: z.enum(['CAR', 'BIKE', 'EV', 'HANDICAP_ACCESSIBLE'], {
    errorMap: () => ({ message: 'Please select a valid vehicle type' })
  }),
  
  staffId: z.string()
    .min(1, 'Staff member is required'),
  
  billingType: z.enum(['HOURLY', 'DAY_PASS']).optional(),
  
  ownerName: z.string().optional(),
  
  ownerPhone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal(''))
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;