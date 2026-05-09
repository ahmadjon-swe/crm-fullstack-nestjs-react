export const jwtConstants = {
  access_secret: process.env.JWT_ACCESS_SECRET ?? 'access_fallback_secret',
  refresh_secret: process.env.JWT_REFRESH_SECRET ?? 'refresh_fallback_secret',
};
