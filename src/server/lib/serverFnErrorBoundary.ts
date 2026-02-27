export class PublicServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicServerError";
  }
}

interface ErrorBoundaryOptions<TArgs> {
  fallbackMessage?: string;
  passThroughMessages?: string[];
  getLogContext?: (args: TArgs) => Record<string, unknown>;
}

export function withServerFnErrorBoundary<TArgs, TResult>(
  operation: string,
  handler: (args: TArgs) => Promise<TResult>,
  options: ErrorBoundaryOptions<TArgs> = {},
) {
  const passThroughMessages = new Set(options.passThroughMessages ?? []);

  return async (args: TArgs): Promise<TResult> => {
    try {
      return await handler(args);
    } catch (error) {
      if (error instanceof PublicServerError) {
        throw error;
      }

      if (error instanceof Error && passThroughMessages.has(error.message)) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      const cause =
        error instanceof Error && "cause" in error
          ? (error as { cause?: unknown }).cause
          : undefined;
      const logContext = options.getLogContext?.(args);
      console.error(`${operation} failed`, {
        message,
        cause,
        stack: error instanceof Error ? error.stack : undefined,
        ...logContext,
      });

      throw new PublicServerError(
        options.fallbackMessage ?? "Something went wrong. Please try again.",
      );
    }
  };
}
