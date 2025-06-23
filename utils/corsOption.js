const allowedOrigins = [
  "http://localhost:3000",
  "https://crm-frontend-atozeevisas.vercel.app",
  "https://crm-frontend-live.vercel.app",
  "https://crm-frontend-eta-olive.vercel.app",
];

module.exports = {
  origin: allowedOrigins,
  credentials: true,
};
