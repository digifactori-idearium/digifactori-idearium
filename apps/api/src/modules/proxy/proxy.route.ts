import {
  Request,
  Response,
  Router,
  type Router as ExpressRouter,
} from 'express';
import RateLimit from 'express-rate-limit';

import { isAllowedUrl } from './proxy.utils';

const proxyRouter: ExpressRouter = Router();

const IS_DEV = process.env.NODE_ENV === 'development';
const ALLOWED_SCHEMES = new Set(['https:', 'http:']);
const BLOCKED_HOSTNAMES = /^(localhost|.*\.local|.*\.internal)$/i;
const PRIVATE_IP =
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1$|fc|fd)/;
const DEV_PROXY_ALLOW_LOCAL = process.env.DEV_PROXY_ALLOW_LOCAL === 'true';

function parseSafeUrl(raw: string): URL | null {
  try {
    const parsed = new URL(raw);
    if (!ALLOWED_SCHEMES.has(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;

    const isLocal =
      BLOCKED_HOSTNAMES.test(parsed.hostname) ||
      PRIVATE_IP.test(parsed.hostname);

    if (isLocal) {
      if (IS_DEV && DEV_PROXY_ALLOW_LOCAL) return parsed;
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
const proxyLimiter = RateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: 'Too many proxy requests, slow down.' },
});

proxyRouter.get('/', proxyLimiter, async (req: Request, res: Response) => {
  const raw = req.query.url as string;

  if (!raw) {
    return res.status(400).json({ error: 'Missing url param' });
  }

  // Parse valide utl
  const parsed = parseSafeUrl(raw);
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid or disallowed URL' });
  }

  // check the allow list based on the valide url
  if (!(await isAllowedUrl(parsed.toString()))) {
    return res.status(403).json({
      error: 'Domain not allowed',
      hint: 'Only domains registered as active integrations can be proxied',
    });
  }

  try {
    // forward good secure headers.
    const forwarded = new Headers();
    for (const key of ['authorization', 'x-auth-token', 'accept']) {
      const val = req.headers[key];
      if (val) forwarded.set(key, val as string);
    }

    // disable automatic redirect following.
    const response = await fetch(parsed.toString(), {
      method: 'GET',
      headers: forwarded,
      redirect: 'manual',
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        return res
          .status(502)
          .json({ error: 'Upstream redirect missing Location header' });
      }

      // Resolve relative redirects against the original origin.
      const redirectUrl = parseSafeUrl(new URL(location, parsed).toString());
      if (!redirectUrl || !(await isAllowedUrl(redirectUrl.toString()))) {
        return res.status(403).json({ error: 'Redirect target not allowed' });
      }

      return res
        .status(response.status)
        .setHeader('Location', redirectUrl.toString())
        .end();
    }

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
