import { Alert } from 'react-native';
import { HttpStatus } from '../constants/StatusConstants';

interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * Centralized error handling utility
 */
export class ErrorHandler {
  /**
   * Handle WHOOP API errors with appropriate user messages
   */
  static handleWhoopError(error: ErrorResponse, context: 'fetch' | 'auth' = 'fetch'): {
    shouldClearToken: boolean;
    message: string;
    title: string;
  } {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    // Token expiration
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      return {
        shouldClearToken: true,
        title: 'WHOOP Connection Expired',
        message: 'Your WHOOP connection has expired. Please reconnect in the Profile tab.',
      };
    }

    // No data available
    if (status === HttpStatus.NOT_FOUND) {
      const message = context === 'fetch'
        ? serverMessage || 'No sleep data found in your WHOOP account. Make sure you have been wearing your device during sleep.'
        : 'Resource not found';

      return {
        shouldClearToken: false,
        title: 'No Sleep Data',
        message,
      };
    }

    // Generic error
    const message = serverMessage || error.message || 'Failed to communicate with WHOOP. Please check your connection and try again.';

    return {
      shouldClearToken: false,
      title: 'Error',
      message,
    };
  }

  /**
   * Show alert with error details
   */
  static showAlert(title: string, message: string) {
    Alert.alert(title, message);
  }

  /**
   * Handle API errors and show appropriate alerts
   */
  static async handleApiError(
    error: ErrorResponse,
    options?: {
      context?: 'fetch' | 'auth';
      onTokenExpired?: () => Promise<void>;
    }
  ): Promise<void> {
    const { shouldClearToken, title, message } = this.handleWhoopError(
      error,
      options?.context
    );

    if (shouldClearToken && options?.onTokenExpired) {
      await options.onTokenExpired();
    }

    this.showAlert(title, message);
  }
}

/**
 * Safely parse error messages from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}
