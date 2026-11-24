import {z} from 'zod';

import {toE164Nigeria} from '@grov/ui';

import {parseCoordinates, ZONE_RULES} from './geo';

export const MIN_RADIUS_KM = ZONE_RULES.circleRadiusMinMetres / 1000;
export const MAX_RADIUS_KM = ZONE_RULES.circleRadiusMaxMetres / 1000;

/** The form's fields; the API body is assembled in the page from these values. */
export const newStoreSchema = z.object({
  name: z.string().trim().min(1, 'Name the store').max(120),
  slug: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters')
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lower-case letters, numbers and single hyphens'),
  cityId: z.string().min(1, 'Pick the city'),
  address: z.string().trim().min(1, 'Enter the street address riders collect from').max(300),
  phone: z
    .string()
    .trim()
    .refine(
      v => v === '' || toE164Nigeria(v) !== null,
      'Enter a Nigerian phone number, like 0803 123 4567'
    ),
  coordinates: z
    .string()
    .refine(
      v => parseCoordinates(v) !== null,
      'Drop the pin on the map, or paste coordinates like 7.4429, 3.9078'
    ),
  radiusKm: z
    .number({error: 'Enter a radius in km'})
    .min(MIN_RADIUS_KM, `Use at least ${MIN_RADIUS_KM} km`)
    .max(MAX_RADIUS_KM, `Use at most ${MAX_RADIUS_KM} km`),
  openNow: z.boolean(),
});

export type NewStoreValues = z.infer<typeof newStoreSchema>;
