const allowedOrigins = [
  "http://localhost:3000",
  "https://crm-frontend-live.vercel.app",
  "https://crm-frontend-eta-olive.vercel.app",
  "http://43.204.111.78",
];

module.exports = {
  origin: allowedOrigins,
  credentials: true,
};
