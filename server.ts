import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './backend/src/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to determine the production static assets directory
function getDistPath(): string {
  // When bundled into dist/server.js, index.html is located in the same directory
  if (fs.existsSync(path.resolve(__dirname, 'index.html'))) {
    return __dirname;
  }
  // When running from workspace root
  return path.resolve(__dirname, 'dist');
}

async function startServer() {
  const app = express();
  // Cloud Run provides the PORT environment variable (e.g. PORT=3000)
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';
  const isProd = process.env.NODE_ENV === 'production';

  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Vite dev scripts & assets
    })
  );
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );
  app.use(express.json());

  // Cloud health probe alias
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'HostelSphere API is running',
    });
  });

  // Mount backend API routes
  app.use('/api', apiRouter);

  // Catch-all for undefined /api/* routes: MUST return JSON 404, never index.html
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      error: { code: 'NOT_FOUND' },
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = getDistPath();
    app.use(express.static(distPath));

    // Client-side SPA routing fallback for non-API routes (/login, /signup, /admin, etc.)
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: { code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  app.listen(PORT, HOST, () => {
    console.log('HostelSphere production server starting...');
    console.log(`PORT: ${PORT}`);
    console.log(`HOST: ${HOST}`);
    console.log(`[HostelSphere] Unified server successfully listening at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Fatal Error starting server]', err);
  process.exit(1);
});
