import { createCrudService } from './crudFactory';

export const ProspectsService = createCrudService<any>('prospects');
export const BookingsService = createCrudService<any>('bookings');
export const ClientsService = createCrudService<any>('clients');
export const ProjectsService = createCrudService<any>('projects');
export const FreelancersService = createCrudService<any>('freelancers');
export const AccountsService = createCrudService<any>('accounts');
export const CategoriesService = createCrudService<any>('categories');
export const TransactionsService = createCrudService<any>('transactions');
export const CalendarEventsService = createCrudService<any>('calendar_events');
export const SocialPostsService = createCrudService<any>('social_posts');
export const PackagesService = createCrudService<any>('packages');
export const AssetsService = createCrudService<any>('assets');
export const ContractsService = createCrudService<any>('contracts');
export const PromoCodesService = createCrudService<any>('promo_codes');
export const SOPsService = createCrudService<any>('sops');
export const ClientReportsService = createCrudService<any>('client_reports');
export const SettingsService = createCrudService<any>('settings');

