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
export type ProductListing = Schemas['ProductListing'];
export type AdminStoreOption = Schemas['AdminStoreOption'];

// Staff and invites (doc 32)
export type StaffMember = Schemas['StaffMember'];
export type StaffRole = Schemas['StaffRole'];
export type StaffStatus = StaffMember['status'];
export type AdminInvite = Schemas['AdminInvite'];
export type AdminInviteStatus = AdminInvite['status'];
export type InviteCheck = Schemas['InviteCheck'];

// Stores and cities (ADR 0001)
export type AdminStore = Schemas['AdminStore'];
export type AdminStoreDetail = Schemas['AdminStoreDetail'];
export type StoreStatus = AdminStore['status'];
export type AdminCity = Schemas['AdminCity'];
export type CityStatus = AdminCity['status'];
export type CitySummary = Schemas['CitySummary'];
export type Pin = Schemas['Pin'];
export type GeoJsonMultiPolygon = Schemas['GeoJsonMultiPolygon'];
export type DeliveryConfig = Schemas['DeliveryConfig'];
export type DeliveryConfigPatch = Schemas['DeliveryConfigPatch'];
export type EffectiveDeliveryConfig = Schemas['EffectiveDeliveryConfig'];
export type DeliveryConfigSource = EffectiveDeliveryConfig['sources']['deliveryDays'];
export type AdminCoverage = Schemas['AdminCoverage'];

// Catalogue: products, sizes, prep options, categories (ADR 0001 §4)
export type Product = Schemas['Product'];
export type ProductSummary = Schemas['ProductSummary'];

// Store listings: which products a store sells
export type StoreListing = Schemas['StoreListing'];
export type PutListingBody = RequestBody<'/v1/admin/store/products/{productId}', 'put'>;
export type CopyListingsResult = Schemas['CopyListingsResult'];
export type PriceMarkup = Schemas['PriceMarkup'];
export type PriceMarkupValue = Schemas['PriceMarkupValue'];
export type ProductSize = Schemas['ProductSize'];
export type ProductPrepOption = Schemas['ProductPrepOption'];
export type SizeSellMode = ProductSize['sellMode'];
export type PrepPriceMode = ProductPrepOption['priceMode'];
export type Category = Schemas['Category'];
export type CategoryTint = Category['tintKey'];
export type Allergen = Schemas['Allergen'];

// Foods (doc 17): the repository products are made from
export type Food = Schemas['Food'];
export type FoodStatus = Food['status'];
export type FoodProduct = Schemas['FoodProduct'];
export type StoredFile = Schemas['StoredFile'];
export type FileUrl = Schemas['FileUrl'];

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
export type CreateStoreBody = RequestBody<'/v1/admin/stores', 'post'>;
export type UpdateStoreBody = RequestBody<'/v1/admin/stores/{storeId}', 'patch'>;
export type SetDeliveryZoneBody = RequestBody<'/v1/admin/stores/{storeId}/delivery-zone', 'put'>;
export type CoverageCheckBody = RequestBody<'/v1/admin/stores/coverage-check', 'post'>;
export type CreateCityBody = RequestBody<'/v1/admin/cities', 'post'>;
export type UpdateCityBody = RequestBody<'/v1/admin/cities/{cityId}', 'patch'>;
export type UpdateRoleBody = RequestBody<'/v1/admin/roles/{roleId}', 'patch'>;
export type UpdateStaffAccessBody = Schemas['UpdateStaffAccess'];
export type CreateInviteBody = Schemas['CreateAdminInvite'];
export type PasswordInviteAcceptBody = Schemas['PasswordInviteAccept'];
export type CreateProductBody = RequestBody<'/v1/admin/products', 'post'>;
export type UpdateProductBody = RequestBody<'/v1/admin/products/{productId}', 'patch'>;
export type ReplaceSizesBody = RequestBody<'/v1/admin/products/{productId}/sizes', 'put'>;
export type SizeInput = ReplaceSizesBody['sizes'][number];
export type ReplacePrepOptionsBody = RequestBody<
  '/v1/admin/products/{productId}/prep-options',
  'put'
>;
export type PrepOptionInput = ReplacePrepOptionsBody['prepOptions'][number];
export type ProductAvailability = NonNullable<CreateProductBody['availability']>;
export type CreateCategoryBody = RequestBody<'/v1/admin/categories', 'post'>;
export type UpdateCategoryBody = RequestBody<'/v1/admin/categories/{categoryId}', 'patch'>;
export type DeviceInput = CodeVerifyBody['device'];

export type CatalogueRow = Schemas['CatalogueRow'];
export type CatalogueSummary = Schemas['CatalogueSummary'];
export type CataloguePage = Schemas['CataloguePage'];
export type CatalogueAnalytics = Schemas['CatalogueAnalytics'];
export type ComparedMetric = Schemas['ComparedMetric'];
export type AnalyticsPeriod = Schemas['AnalyticsPeriod'];
export type StockState = Schemas['StockState'];
export type OrderStats = Schemas['OrderStats'];
export type OrderItemType = Schemas['OrderItemType'];
export type OrderRevenueSource = Schemas['OrderRevenueSource'];
export type OrderBucket = Schemas['OrderBucket'];
export type OrderPattern = Schemas['OrderPattern'];
export type ProductPerformance = Schemas['ProductPerformance'];
export type PerformancePoint = Schemas['PerformancePoint'];
export type StorePerformance = Schemas['StorePerformance'];
export type ProductStock = Schemas['ProductStock'];
export type ProductStoreStock = Schemas['ProductStoreStock'];
export type ProductStockMovement = Schemas['ProductStockMovement'];
export type ProductPricing = Schemas['ProductPricing'];
export type SizePricing = Schemas['SizePricing'];
export type StorePrice = Schemas['StorePrice'];
export type PriceHistoryPoint = Schemas['PriceHistoryPoint'];
export type ActivityItem = Schemas['ActivityItem'];
export type FieldChange = Schemas['FieldChange'];
export type ImportJob = Schemas['Import'];
export type CreateImportBody = RequestBody<'/v1/admin/imports', 'post'>;
export type AuditLogItem = Schemas['AuditLogItem'];
export type AuditLogDetail = Schemas['AuditLogDetail'];
export type AuditSubject = Schemas['AuditSubject'];
export type AuditActor = Schemas['AuditActor'];
export type AuditStats = Schemas['AuditStats'];
export type AuditMetric = Schemas['AuditMetric'];
export type AuditSeriesPoint = Schemas['AuditSeriesPoint'];
export type AuditBreakdownRow = Schemas['AuditBreakdownRow'];
export type AuditFacets = Schemas['AuditFacets'];
export type AuditFieldChange = Schemas['AuditFieldChange'];
export type AuditActionKind = AuditLogItem['kind'];
// gen:resource:types
