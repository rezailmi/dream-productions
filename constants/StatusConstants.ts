/**
 * Dream status constants
 * Using const assertions for type safety
 */
export const DreamStatus = {
  GENERATING: 'generating',
  COMPLETE: 'complete',
  FAILED: 'failed',
} as const;

export type DreamStatusType = typeof DreamStatus[keyof typeof DreamStatus];

/**
 * Data source constants
 */
export const DataSourceType = {
  DEMO: 'demo',
  APPLE_HEALTH: 'apple-health',
  WHOOP: 'whoop',
} as const;

export type DataSource = typeof DataSourceType[keyof typeof DataSourceType];

/**
 * HTTP status codes for error handling
 */
export const HttpStatus = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
