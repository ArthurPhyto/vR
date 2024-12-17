export const config = {
  port: process.env.PORT || 3001,
  clientOrigin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development'
};