## MODIFIED Requirements

### Requirement: Dynamic MFE Registration

The system SHALL support dynamic registration of MFE extensions and domains at runtime. There is NO static configuration - all registration is dynamic.

**Important**: MfManifest is internal to MfeHandlerMF. See [Manifest as Internal Implementation Detail](../../design/mfe-loading.md#decision-12-manifest-as-internal-implementation-detail-of-mfehandlermf).

#### Scenario: Dynamic MFE isolation principles (default handler)

HAI3's default handler enforces instance-level isolation. See [Runtime Isolation](../../design/overview.md#runtime-isolation-default-behavior) for the complete isolation model.

- **WHEN** loading an MFE with the default handler
- **THEN** each MFE instance SHALL have its own isolated runtime
- **AND** any dependency MAY be listed in `sharedDependencies` for bundle code optimization; `singleton: false` ensures each MFE gets its own isolated instance from the shared code regardless of whether the package is stateful

## REMOVED Requirements

### Requirement: MFE Version Validation

**Reason**: MFEs always bundle their own local fallback copies (`import: true` is the default). A version mismatch simply means the MFE uses its own bundled copy instead of a shared one — a bigger download, but fully functional. Since sharing is a download optimization (not a correctness requirement), version mismatches are never errors. The `MfeVersionMismatchError` class and version warning logging are removed.

**Migration**: No migration needed. MFEs that previously relied on `MfeVersionMismatchError` being thrown should instead handle load failures generically via the existing `MfeLoadError` and actions chain fallback mechanisms. Version mismatches no longer produce errors or warnings — the MFE silently falls back to its own bundled copy.
