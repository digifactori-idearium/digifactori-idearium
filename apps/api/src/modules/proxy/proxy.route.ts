import {
  Request,
  Response,
  Router,
  type Router as ExpressRouter,
} from 'express';
import RateLimit from 'express-rate-limit';

import { isAllowedUrl } from './proxy.utils';

const proxyRouter: ExpressRouter = Router();

const proxyLimiter = RateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: 'Too many proxy requests, slow down.' },
});

proxyRouter.get('/', proxyLimiter, async (req: Request, res: Response) => {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).json({ error: 'Missing url param' });
  }

  if (!(await isAllowedUrl(url))) {
    return res.status(403).json({
      error: 'Domain not allowed',
      hint: 'Only domains registered as active integrations can be proxied',
    });
  }

  try {
    const forwarded = new Headers();
    for (const key of ['authorization', 'x-auth-token', 'accept']) {
      const val = req.headers[key];
      if (val) forwarded.set(key, val as string);
    }

    const response = await fetch(url, { method: 'GET', headers: forwarded });

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status);

    return res.send(await response.text());
  } catch (err) {
    console.error('[proxy] fetch failed:', err);
    return res.status(502).json({ error: 'Upstream request failed' });
  }
});

export default proxyRouter;
