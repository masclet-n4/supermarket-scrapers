export function getRandomNumberBetween(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min)
}

import { sleep } from 'bun'

export type HttpErrorHandler = (attempt: number) => number | undefined

export async function fetchWithErrorHandling(
  url: string,
  init?: RequestInit,
  handlers: Record<number, HttpErrorHandler> = {},
): Promise<Response> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    const response = await fetch(url, init)
    if (response.ok) return response

    const delay = handlers[response.status]?.(attempt)
    if (delay === undefined || attempt === 2) return response
    await sleep(delay)
  }
  throw new Error('Unreachable')
}
