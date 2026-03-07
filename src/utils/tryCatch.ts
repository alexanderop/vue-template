interface Success<T> {
  data: T
  error: null
}

interface Failure {
  data: null
  error: Error
}

export type Result<T> = Failure | Success<T>

export function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  return promise.then(
    (data): Success<T> => ({ data, error: null }),
    (error: unknown): Failure => ({
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    }),
  )
}
