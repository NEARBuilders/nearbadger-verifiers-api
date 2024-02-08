import { ipAddress, next } from '@vercel/edge'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
})

export const config = {
  matcher: '/',
}

export default async function middleware(request) {
  const ip = ipAddress(request) || '127.0.0.1'
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    ip
  )

  return success ? next() : Response.redirect(new URL('/blocked.html', request.url))
}