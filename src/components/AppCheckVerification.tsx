// App Check verification component for security testing
import React, { useState, useEffect } from 'react';
import { appCheckMiddleware } from '../middleware/appCheckMiddleware';
import { getAppCheckLogs, clearAppCheckLogs } from '../utils/app-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, RefreshCw, Shield, AlertTriangle } from 'lucide-react';

interface AppCheckStatus {
  isEnabled: boolean;
  tokenValid: boolean;
  lastToken: string | null;
  error: string | null;
}

export const AppCheckVerification: React.FC = () => {
  const [status, setStatus] = useState<AppCheckStatus>({
    isEnabled: false,
    tokenValid: false,
    lastToken: null,
    error: null
  });
  const [logs, setLogs] = useState<unknown[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAppCheckStatus = async () => {
    setIsLoading(true);
    try {
      // Test App Check token generation
      const token = await appCheckMiddleware.getValidToken(true);
      const isValid = appCheckMiddleware.validateToken(token);
      
      setStatus({
        isEnabled: true,
        tokenValid: isValid,
        lastToken: token ? `${token.substring(0, 20)}...` : null,
        error: null
      });
      
      // Update logs and stats
      setLogs(getAppCheckLogs());
      setStats(appCheckMiddleware.getSecurityStats());
    } catch (error) {
      setStatus({
        isEnabled: false,
        tokenValid: false,
        lastToken: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEnforcement = async () => {
    setIsLoading(true);
    try {
      await appCheckMiddleware.enforceAppCheck('test_operation');
      setLogs(getAppCheckLogs());
      setStats(appCheckMiddleware.getSecurityStats());
    } catch (error) {
      console.error('App Check enforcement test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    clearAppCheckLogs();
    setLogs([]);
    setStats(null);
  };


  useEffect(() => {
    checkAppCheckStatus();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Firebase App Check Status
          </CardTitle>
          <CardDescription>
            Security verification and monitoring for Firebase App Check
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">App Check Enabled:</span>
              <Badge variant={status.isEnabled ? "default" : "destructive"}>
                {status.isEnabled ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Enabled</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Disabled</>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Token Valid:</span>
              <Badge variant={status.tokenValid ? "default" : "destructive"}>
                {status.tokenValid ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Valid</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Invalid</>
                )}
              </Badge>
            </div>
          </div>

          {status.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error: {status.error}
              </AlertDescription>
            </Alert>
          )}

          {status.lastToken && (
            <div className="text-sm">
              <span className="font-medium">Last Token:</span> {status.lastToken}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={checkAppCheckStatus} 
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
            <Button 
              onClick={testEnforcement} 
              disabled={isLoading}
              variant="outline"
            >
              Test Enforcement
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Security Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Events</div>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
              </div>
              <div>
                <div className="font-medium">Token Requests</div>
                <div className="text-2xl font-bold text-blue-600">{stats.tokenRequests}</div>
              </div>
              <div>
                <div className="font-medium">Success Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.tokenRequests > 0 
                    ? Math.round((stats.tokenSuccesses / stats.tokenRequests) * 100)
                    : 0}%
                </div>
              </div>
              <div>
                <div className="font-medium">Cache Hits</div>
                <div className="text-2xl font-bold text-purple-600">{stats.cacheHits}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Security Logs</CardTitle>
              <CardDescription>
                Recent App Check events and security monitoring
              </CardDescription>
            </div>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {logs.slice(-20).reverse().map((log, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded border">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{log.event}</span>
                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-1 text-gray-600">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
