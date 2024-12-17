import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';
import { CrawlerService } from './services/crawler.service.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.clientOrigin,
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve static files in production
if (config.nodeEnv === 'production') {
  app.use(express.static('dist'));
}

const crawlerService = new CrawlerService();

io.on('connection', (socket) => {
  logger.info('Client connected');

  socket.on('start_crawl', async ({ url, jobId }) => {
    try {
      await crawlerService.crawlWebsite(url, (message) => {
        io.emit(`crawl:${jobId}`, message);
      });
    } catch (error) {
      logger.error(`Crawl error: ${error.message}`);
      io.emit(`crawl:${jobId}`, {
        type: 'error',
        message: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

httpServer.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});