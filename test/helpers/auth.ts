import request from 'supertest'
import type { App } from 'supertest/types'

export const getAccessToken = async (): Promise<string> => {
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_CLIENT_ID ?? '',
      client_secret: process.env.AUTH0_CLIENT_SECRET ?? '',
      audience: process.env.AUTH0_AUDIENCE ?? '',
    }),
  })
  const json = (await res.json()) as { access_token?: string; error?: string }

  if (!res.ok || !json.access_token) {
    throw new Error(`Auth0 token failed: ${json.error ?? res.status}`)
  }

  return json.access_token
}

export const authedRequest = (server: App, token: string) => ({
  get: (url: string) => request(server).get(url).auth(token, { type: 'bearer' }),
  post: (url: string) =>
    request(server).post(url).auth(token, { type: 'bearer' }),
  put: (url: string) => request(server).put(url).auth(token, { type: 'bearer' }),
  delete: (url: string) =>
    request(server).delete(url).auth(token, { type: 'bearer' }),
})

