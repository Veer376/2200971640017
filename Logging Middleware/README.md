# Logging Middleware

A reusable logging middleware for both backend and frontend applications that sends logs to a central server.

## Installation

First, install the dependencies:

```bash
cd "Logging Middleware"
npm install
npm run build
```

## Usage

The middleware includes pre-configured credentials for this assignment. Here's how to use it:

### Automatic initialization

```javascript
const { Log, initialize } = require('../Logging Middleware/dist');

async function example() {
  // Initialize the logger (authenticates using the pre-configured credentials)
  await initialize();
  
  // Then you can send logs directly
  await Log('backend', 'info', 'service', 'User registration successful');
}
```

### Manual initialization (if needed)

```javascript
const { Log, getAuthToken } = require('../Logging Middleware/dist');

async function example() {
  // Authenticate with custom credentials if needed
  await getAuthToken(
    'email',
    'name',
    'rollNo',
    'accessCode',
    'clientID',
    'clientSecret'
  );
  
  // Then send logs
  await Log('frontend', 'info', 'component', 'Component mounted');
}
```

## API Reference

### `initialize()`

Initializes the logger using the pre-configured credentials.

- **Returns:** Promise that resolves with the authentication token

### `Log(stack, level, package, message)`

Sends a log message to the central logging server. Will auto-initialize if needed.

- **Parameters:**
  - `stack` (string): Either 'backend' or 'frontend'
  - `level` (string): One of 'debug', 'info', 'warn', 'error', 'fatal'
  - `package` (string): The package or module generating the log (see constraints below)
  - `message` (string): The log message

- **Returns:** Promise that resolves with the response from the server

### `configureLogger(config)`

Configure the logger with custom settings.

- **Parameters:**
  - `config` (object): Configuration object with `baseUrl` and `token` properties

### `getAuthToken(email, name, rollNo, accessCode, clientID, clientSecret)`

Obtains an authentication token from the API.

- **Parameters:**
  - `email` (string): Your email address
  - `name` (string): Your name
  - `rollNo` (string): Your roll number
  - `accessCode` (string): The access code provided
  - `clientID` (string): Your client ID
  - `clientSecret` (string): Your client secret

- **Returns:** Promise that resolves with the authentication token

## Constraints

### Stack Values
- `backend`
- `frontend`

### Level Values
- `debug`
- `info`
- `warn`
- `error`
- `fatal`

### Package Values

#### Backend-only Packages
- `cache`
- `controller`
- `cron_job`
- `db`
- `domain`
- `handler`
- `repository`
- `route`
- `service`

#### Frontend-only Packages
- `api`
- `component`
- `hook`
- `page`
- `state`
- `style`

#### Shared Packages (can be used in both Backend and Frontend)
- `auth`
- `config`
- `middleware`
- `utils`
