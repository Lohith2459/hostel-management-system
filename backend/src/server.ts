import app from './app.js';

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('HostelSphere production server starting...');
  console.log(`PORT: ${PORT}`);
  console.log(`HOST: ${HOST}`);
  console.log(`[HostelSphere Backend] Server is running on http://${HOST}:${PORT}`);
});
