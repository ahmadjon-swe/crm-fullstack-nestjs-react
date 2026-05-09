export const jwtConstants = {
  access_secret: process.env.JWT_ACCESS_SECRET ?? 'crm_access_secret_change_in_production',
  refresh_secret: process.env.JWT_REFRESH_SECRET ?? 'crm_refresh_secret_change_in_production',
  access_expires: process.env.JWT_ACCESS_EXPIRES ?? '30m',
  refresh_expires: process.env.JWT_REFRESH_EXPIRES ?? '15d',
};
