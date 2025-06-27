import axios, { AxiosResponse } from 'axios';

// Define types for stack, level, and package according to the requirements
export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Backend-only packages
export type BackendPackage = 
  'cache' | 'controller' | 'cron_job' | 'db' | 
  'domain' | 'handler' | 'repository' | 'route' | 'service';

// Frontend-only packages
export type FrontendPackage = 
  'api' | 'component' | 'hook' | 'page' | 'state' | 'style';

// Shared packages
export type SharedPackage = 
  'auth' | 'config' | 'middleware' | 'utils';

// Union type for all package types
export type Package = BackendPackage | FrontendPackage | SharedPackage;

// Response type from the logging API
interface LogResponse {
  logID: string;
  message: string;
}

// Response type from the authentication API
interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: string;
}

// User credentials - stored for this assignment
const credentials = {
  email: 'aryaveer1214@gmail.com',
  name: 'aryaveer',
  rollNo: '2200971640017',
  accessCode: 'Muagvq',
  clientID: '40ae34c7-cad3-4e83-8108-444b1ea32e07',
  clientSecret: 'ZRgJVpZzvMKzmmKS'
};

// Base URL for the API service
const baseUrl = 'http://20.244.56.144/evaluation-service';

// Authentication token
let token = '';

// Authentication state
let isAuthenticating = false;
let authPromise: Promise<string> | null = null;

/**
 * Internal function to authenticate with the service
 * Uses the hardcoded credentials for this assignment
 */
async function authenticate(): Promise<string> {
  try {
    if (isAuthenticating && authPromise) {
      return authPromise;
    }

    isAuthenticating = true;
    authPromise = (async () => {
      const response = await axios.post<AuthResponse>(
        `${baseUrl}/auth`,
        credentials
      );
      
      token = response.data.access_token;
      return token;
    })();

    return await authPromise;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      throw new Error(`Authentication failed: ${errorMsg}`);
    }
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    isAuthenticating = false;
    authPromise = null;
  }
}

/**
 * Validate that the package is appropriate for the stack
 */
function validatePackageForStack(stack: Stack, pkg: Package): boolean {
  // Backend-only packages
  const backendOnly: BackendPackage[] = [
    'cache', 'controller', 'cron_job', 'db', 
    'domain', 'handler', 'repository', 'route', 'service'
  ];
  
  // Frontend-only packages
  const frontendOnly: FrontendPackage[] = [
    'api', 'component', 'hook', 'page', 'state', 'style'
  ];
  
  // Shared packages
  const shared: SharedPackage[] = [
    'auth', 'config', 'middleware', 'utils'
  ];

  if (stack === 'backend') {
    return backendOnly.includes(pkg as BackendPackage) || shared.includes(pkg as SharedPackage);
  } else if (stack === 'frontend') {
    return frontendOnly.includes(pkg as FrontendPackage) || shared.includes(pkg as SharedPackage);
  }
  
  return false;
}

/**
 * Main logging function that sends logs to the remote server
 * Automatically authenticates if needed
 * 
 * @param stack Where the log is coming from ('backend' or 'frontend')
 * @param level The severity level of the log
 * @param pkg The package or module generating the log
 * @param message The log message
 * @returns Promise that resolves with the response from the server
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<AxiosResponse<LogResponse>> {
  // Validate inputs
  if (!['backend', 'frontend'].includes(stack)) {
    throw new Error(`Invalid stack: ${stack}. Must be 'backend' or 'frontend'`);
  }

  if (!['debug', 'info', 'warn', 'error', 'fatal'].includes(level)) {
    throw new Error(`Invalid level: ${level}. Must be one of 'debug', 'info', 'warn', 'error', or 'fatal'`);
  }

  if (!validatePackageForStack(stack, pkg)) {
    throw new Error(`Invalid package ${pkg} for stack ${stack}`);
  }

  if (!message || typeof message !== 'string') {
    throw new Error('Message is required and must be a string');
  }

  // If no token is set, authenticate first
  if (!token) {
    try {
      await authenticate();
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Make the API call
  try {
    // Format the request payload exactly as expected by the API
    const payload = {
      stack,
      level,
      package: pkg,
      message
    };
    
    const response = await axios.post<LogResponse>(
      `${baseUrl}/logs`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response;
  } catch (error) {
    // If unauthorized (token expired), try to authenticate again
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      token = ''; // Reset token
      try {
        await authenticate();
        
        // Try the request again with the new token
        // Format the request payload exactly as expected by the API
        const payload = {
          stack,
          level,
          package: pkg,
          message
        };
        
        return await axios.post<LogResponse>(
          `${baseUrl}/logs`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (authError) {
        throw new Error(`Authentication failed: ${authError instanceof Error ? authError.message : String(authError)}`);
      }
    }

    // For other errors
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      throw new Error(`Failed to send log: ${errorMsg}`);
    }
    throw new Error(`Failed to send log: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Export only the Log function as the default
export default Log;
