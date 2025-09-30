// App Check middleware for enforcing security
import { getAppCheckToken, verifyAppCheckToken, logAppCheckEvent } from '@/utils/app-check';

/**
 * Middleware to enforce App Check token validation
 * This should be used before any Firebase operations
 */
export class AppCheckMiddleware {
  private static instance: AppCheckMiddleware;
  private tokenCache: Map<string, { token: string; expires: number }> = new Map();
  private readonly TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): AppCheckMiddleware {
    if (!AppCheckMiddleware.instance) {
      AppCheckMiddleware.instance = new AppCheckMiddleware();
    }
    return AppCheckMiddleware.instance;
  }

  /**
   * Get a valid App Check token (with caching)
   * @param forceRefresh - Force refresh the token
   * @returns Promise<string> - The App Check token
   */
  async getValidToken(forceRefresh: boolean = false): Promise<string> {
    const cacheKey = 'default';
    const now = Date.now();
    
    // Check cache first
    if (!forceRefresh && this.tokenCache.has(cacheKey)) {
      const cached = this.tokenCache.get(cacheKey)!;
      if (now < cached.expires) {
        logAppCheckEvent('token_cache_hit', { cached: true });
        return cached.token;
      }
    }

    try {
      logAppCheckEvent('token_request_start');
      const token = await getAppCheckToken();
      
      // Cache the token
      this.tokenCache.set(cacheKey, {
        token,
        expires: now + this.TOKEN_CACHE_DURATION
      });
      
      logAppCheckEvent('token_request_success', { 
        tokenLength: token.length,
        cached: false 
      });
      
      return token;
    } catch (error) {
      logAppCheckEvent('token_request_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Validate that a token is present and valid
   * @param token - The token to validate
   * @returns boolean - Whether the token is valid
   */
  validateToken(token: string): boolean {
    if (!token) {
      logAppCheckEvent('token_validation_failed', { reason: 'no_token' });
      return false;
    }

    if (!verifyAppCheckToken(token)) {
      logAppCheckEvent('token_validation_failed', { reason: 'invalid_format' });
      return false;
    }

    logAppCheckEvent('token_validation_success');
    return true;
  }

  /**
   * Enforce App Check for a Firebase operation
   * @param operation - The operation being performed
   * @returns Promise<string> - The valid token
   */
  async enforceAppCheck(operation: string): Promise<string> {
    logAppCheckEvent('app_check_enforcement', { operation });
    
    try {
      const token = await this.getValidToken();
      
      if (!this.validateToken(token)) {
        throw new Error('Invalid App Check token');
      }
      
      logAppCheckEvent('app_check_success', { operation });
      return token;
    } catch (error) {
      logAppCheckEvent('app_check_failed', { 
        operation, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Clear token cache
   */
  clearCache(): void {
    this.tokenCache.clear();
    logAppCheckEvent('token_cache_cleared');
  }

  /**
   * Get security statistics
   * @returns Object with security stats
   */
  getSecurityStats(): Record<string, number> {
    const logs = JSON.parse(localStorage.getItem('appCheckLogs') || '[]');
    const stats = {
      totalEvents: logs.length,
      tokenRequests: logs.filter((log: Record<string, unknown>) => log.event === 'token_request_start').length,
      tokenSuccesses: logs.filter((log: Record<string, unknown>) => log.event === 'token_request_success').length,
      tokenFailures: logs.filter((log: Record<string, unknown>) => log.event === 'token_request_failed').length,
      validationFailures: logs.filter((log: Record<string, unknown>) => log.event === 'token_validation_failed').length,
      enforcementAttempts: logs.filter((log: Record<string, unknown>) => log.event === 'app_check_enforcement').length,
      enforcementSuccesses: logs.filter((log: Record<string, unknown>) => log.event === 'app_check_success').length,
      enforcementFailures: logs.filter((log: Record<string, unknown>) => log.event === 'app_check_failed').length,
      cacheHits: logs.filter((log: Record<string, unknown>) => log.event === 'token_cache_hit').length
    };
    
    return stats;
  }
}

// Export singleton instance
export const appCheckMiddleware = AppCheckMiddleware.getInstance();
