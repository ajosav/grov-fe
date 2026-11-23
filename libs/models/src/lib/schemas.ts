/**
 * Friendly names for grov-be's OpenAPI schemas. The types come from
 * `generated/api.ts` (run `yarn generate:api-types` after grov-be exports a new
 * `openapi/openapi.json`); never hand-write a type the API already describes.
 */
import type {components, paths} from './generated/api';

type Schemas = components['schemas'];

/** JSON request body of an operation, e.g. `RequestBody<'/v1/auth/login', 'post'>`. */
export type RequestBody<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  requestBody?: {content: {'application/json': infer B}};
}
  ? B
  : never;

// Identity and access
export type Me = Schemas['Me'];
export type Access = Schemas['Access'];
export type AdminAccess = NonNullable<Access['admin']>;
export type AuthUser = Schemas['AuthUser'];
export type AuthResponse = Schemas['AuthResponse'];
export type NextStep = Schemas['NextStep'];
export type CodeVerifyResponse = Schemas['CodeVerifyResponse'];
export type OtpChallengeSummary = Schemas['OtpChallengeSummary'];
export type ProviderNonce = Schemas['ProviderNonce'];
export type ResetLinkCheck = Schemas['ResetLinkCheck'];
export type ForgotPasswordAccepted = Schemas['ForgotPasswordAccepted'];
export type SessionSummary = Schemas['Session'];
export type ClientConfig = Schemas['ClientConfig'];

// Admin access
export type Permission = Schemas['Permission'];
export type PermissionGroup = Schemas['PermissionGroup'];
export type Role = Schemas['Role'];
export type MyStores = Schemas['MyStores'];
export type AdminStoreOption = Schemas['AdminStoreOption'];

// Request bodies
export type LoginBody = RequestBody<'/v1/auth/login', 'post'>;
export type CodeRequestBody = RequestBody<'/v1/auth/code/request', 'post'>;
export type CodeVerifyBody = RequestBody<'/v1/auth/code/verify', 'post'>;
export type CodeCompleteBody = RequestBody<'/v1/auth/code/complete', 'post'>;
export type PhoneCompleteBody = RequestBody<'/v1/auth/phone/complete', 'post'>;
export type ForgotPasswordBody = RequestBody<'/v1/auth/password/forgot', 'post'>;
export type ResetPasswordBody = RequestBody<'/v1/auth/password/reset', 'post'>;
export type UpdateMeBody = RequestBody<'/v1/me', 'patch'>;
export type ConsentBody = RequestBody<'/v1/me/consents', 'post'>;
export type CreateRoleBody = RequestBody<'/v1/admin/roles', 'post'>;
export type SetActiveStoreBody = RequestBody<'/v1/admin/active-store', 'put'>;
export type DeviceInput = CodeVerifyBody['device'];

// gen:resource:types
