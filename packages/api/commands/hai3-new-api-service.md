<!-- @standalone -->
# hai3:new-api-service - Add New API Service (SDK Layer)

## AI WORKFLOW (REQUIRED)
1) Read .ai/targets/API.md before starting.
2) Gather requirements from user.
3) Create OpenSpec proposal for approval.
4) After approval, apply implementation.

## GATHER REQUIREMENTS
Ask user for:
- Service name and domain.
- Endpoints/methods.
- Base URL.
- Protocol (REST, SSE, etc.).

## STEP 1: Create OpenSpec Proposal
Create `openspec/changes/add-{domain}-api-service/` with:

### proposal.md
```markdown
# Proposal: Add {ServiceName} API Service

## Summary
Add new API service "{serviceName}" for {domain} domain.

## Details
- Domain: {domain}
- Base URL: {baseUrl}
- Protocol: {protocol}
- Endpoints: {endpoints}

## SDK Layer Implementation
- Pure BaseApiService extension
- Protocol implementation (REST, SSE, etc.)
- No framework or React dependencies
- No event system integration
- Pure data layer concerns

## Implementation
Create SDK-layer API service with protocol implementation.
```

### tasks.md
```markdown
# Tasks: Add {ServiceName} API Service

- [ ] Create API service class extending BaseApiService
- [ ] Implement protocol (RestProtocol, SseProtocol, etc.)
- [ ] Define TypeScript interfaces for requests/responses
- [ ] Register with apiRegistry
- [ ] Add module augmentation for ApiServicesMap
- [ ] Validate: `npm run type-check`
- [ ] Test API service methods
```

## STEP 2: Wait for Approval
Tell user: "I've created an OpenSpec proposal at `openspec/changes/add-{domain}-api-service/`. Please review and run `/openspec:apply add-{domain}-api-service` to implement."

## STEP 3: Apply Implementation (after approval)
When user runs `/openspec:apply`, execute:

### 3.1 Create Service
File: packages/api/src/{domain}/{Name}ApiService.ts
```typescript
import { BaseApiService, RestProtocol, apiRegistry } from '@hai3/api';

export const DOMAIN = '{domain}' as const;

// Request/Response interfaces
export interface GetDataRequest {
  id: string;
}

export interface DataResponse {
  id: string;
  data: unknown;
}

class {Name}ApiService extends BaseApiService {
  protected baseUrl = '/api/v1/{domain}';

  constructor() {
    super(
      { baseURL: '/api/v1/{domain}' },
      new RestProtocol()
    );
  }

  async getData(request: GetDataRequest): Promise<DataResponse> {
    return this.protocol(RestProtocol).get(`/data/${request.id}`);
  }

  async updateData(id: string, data: unknown): Promise<DataResponse> {
    return this.protocol(RestProtocol).put(`/data/${id}`, { data });
  }

  async deleteData(id: string): Promise<void> {
    return this.protocol(RestProtocol).delete(`/data/${id}`);
  }
}

// Register service
apiRegistry.register(DOMAIN, {Name}ApiService);

// Module augmentation for type safety
declare module '@hai3/api' {
  interface ApiServicesMap {
    [DOMAIN]: {Name}ApiService;
  }
}

// Export for external use
export { {Name}ApiService };
```

### 3.2 Export from Package
Add to packages/api/src/index.ts:
```typescript
export { {Name}ApiService, DOMAIN as {DOMAIN}_DOMAIN } from './{domain}/{Name}ApiService';
export type { GetDataRequest, DataResponse } from './{domain}/{Name}ApiService';
```

### 3.3 Protocol Configuration (Optional)
If using custom protocol configuration:
```typescript
import { RestProtocol } from '@hai3/api';

const customProtocol = new RestProtocol({
  timeout: 30000,
  withCredentials: true,
  contentType: 'application/json',
  headers: {
    'X-API-Version': '1.0',
  },
});

class {Name}ApiService extends BaseApiService {
  constructor() {
    super(
      { baseURL: '/api/v1/{domain}' },
      customProtocol
    );
  }
}
```

### 3.4 Multiple Protocols (Advanced)
If service needs multiple protocols:
```typescript
import { BaseApiService, RestProtocol, SseProtocol } from '@hai3/api';

class {Name}ApiService extends BaseApiService {
  constructor() {
    super(
      { baseURL: '/api/v1/{domain}' },
      new RestProtocol(),
      new SseProtocol()
    );
  }

  async getData(): Promise<DataResponse> {
    return this.protocol(RestProtocol).get('/data');
  }

  streamEvents(onEvent: (data: EventData) => void): () => void {
    return this.protocol(SseProtocol).subscribe('/events', onEvent);
  }
}
```

### 3.5 Validate
```bash
npm run type-check
```

### 3.6 Test Service
```typescript
import { apiRegistry } from '@hai3/api';
import { DOMAIN } from './packages/api/src/{domain}/{Name}ApiService';

// Initialize registry
apiRegistry.initialize({
  useMockApi: false,
});

// Get service
const service = apiRegistry.getService(DOMAIN);

// Test methods
const data = await service.getData({ id: '123' });
console.log('Data:', data);
```

### 3.7 Mark Tasks Complete
Update tasks.md to mark all completed tasks.

## RULES
- REQUIRED: Extend BaseApiService
- REQUIRED: Implement protocol (RestProtocol, SseProtocol, etc.)
- REQUIRED: Register with apiRegistry
- REQUIRED: Define TypeScript interfaces for all requests/responses
- REQUIRED: Module augmentation for ApiServicesMap
- FORBIDDEN: Framework dependencies (@hai3/framework, @hai3/state)
- FORBIDDEN: React dependencies (@hai3/react, React imports)
- FORBIDDEN: Event system integration (eventBus)
- FORBIDDEN: Store/slice references
- FORBIDDEN: Actions or effects
- SDK LAYER: Pure data layer, no business logic, no state management
