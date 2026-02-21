import { z } from "zod";

export const gearRequestSchema = z.object({
    equipment_type: z.string().min(1, "Please select an equipment type"),
    equipment_name: z.string().min(2, "Equipment name must be at least 2 characters"),
    additional_info: z.string().max(300, "Additional info must be less than 300 characters").optional(),
    email: z.string().email("Please enter a valid email address"),
});

export type GearRequestFormValues = z.infer<typeof gearRequestSchema>;
