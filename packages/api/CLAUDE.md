# @hai3/api

API communication protocols and service registry for HAI3 applications.

## SDK Layer

This package is part of the **SDK Layer (L1)** - it has zero @hai3 dependencies and can be used independently. It has `axios` as a peer dependency.

## Core Concepts

### BaseApiService

Abstract base class for domain-specific API services:

```typescript
import { BaseApiService, RestProtocol } from '@hai3/api';

class AccountsApiService extends BaseApiService {
  constructor() {
    super(
      { baseURL: '/api/accounts' },
      new RestProtocol()
    );
  }

  async getCurrentUser(): Promise<User> {
    return this.protocol(RestProtocol).get('/user/current');
  }

  async updateProfile(data: ProfileUpdate): Promise<User> {
    return this.protocol(RestProtocol).put('/user/profile', data);
  }
}
```

### API Registry

Central registry for all API services:

```typescript
import { apiRegistry } from '@hai3/api';

// Register service
apiRegistry.register('accounts', AccountsApiService);

// Initialize (typically at app startup)
apiRegistry.initialize({
  useMockApi: process.env.NODE_ENV === 'development',
  mockDelay: 100
});

// Get service (type-safe)
const accounts = apiRegistry.getService('accounts');
const user = await accounts.getCurrentUser();
```

### Type Safety via Module Augmentation

Extend `ApiServicesMap` to add custom services:

```typescript
declare module '@hai3/api' {
  interface ApiServicesMap {
    accounts: AccountsApiService;
    billing: BillingApiService;
  }
}
```

### Mock Support

Register mocks for development/testing:

```typescript
import { apiRegistry, MockMap } from '@hai3/api';

const accountsMockMap: MockMap = {
  'GET /user/current': () => ({ id: '1', name: 'John Doe' }),
  'GET /users/:id': (body) => ({ id: body.id, name: 'User' }),
  'POST /user/profile': (body) => ({ ...body, updatedAt: new Date() })
};

// Register mocks for domain
apiRegistry.registerMocks('accounts', accountsMockMap);
```

### Plugin System

Extend protocols with plugins:

```typescript
import { MockPlugin, ApiPlugin } from '@hai3/api';

// MockPlugin is built-in (priority 100)
// Intercepts requests and returns mock data

// Custom plugins
class LoggingPlugin implements ApiPlugin {
  name = 'LoggingPlugin';
  priority = 50;

  async onRequest(context) {
    console.log('Request:', context.method, context.url);
    return context;
  }

  async onResponse(context) {
    console.log('Response:', context.status);
    return context;
  }
}

// Register on service
service.registerPlugin(new LoggingPlugin());
```

## Protocol Support

### RestProtocol

HTTP REST API calls via axios:

```typescript
import { RestProtocol } from '@hai3/api';

const restProtocol = new RestProtocol({
  timeout: 30000,
  withCredentials: true,
  contentType: 'application/json'
});
```

## Mock Mode

Toggle mock mode at runtime:

```typescript
// Enable mock mode
apiRegistry.setMockMode(true);

// Disable mock mode
apiRegistry.setMockMode(false);

// Check current mode
const config = apiRegistry.getConfig();
console.log('Mock mode:', config.useMockApi);
```

## Key Rules

1. **Services extend BaseApiService** - Use the base class for protocol management
2. **Register before initialize** - Call `register()` before `initialize()`
3. **One service per domain** - Each bounded context gets one service
4. **Mocks are screenset-specific** - Register mocks in screenset, not in service

## Exports

- `BaseApiService` - Abstract base class
- `RestProtocol` - REST API protocol
- `MockPlugin` - Mock data plugin
- `apiRegistry` - Singleton registry
- `createApiRegistry` - Factory for isolated testing
- `ApiService` - Service interface (type)
- `ApiServicesMap` - Augmentable services map
- `MockMap` - Mock response map type
