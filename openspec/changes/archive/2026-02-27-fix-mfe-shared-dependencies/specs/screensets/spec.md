## REMOVED Requirements

### Requirement: MFE Error Types (partial — MfeVersionMismatchError only)

**Reason**: `MfeVersionMismatchError` is removed because MFEs always bundle local fallbacks. Version mismatches result in silent fallback to the MFE's own bundled copy, not errors. Other MFE error types (`MfeLoadError`, `MfeTypeConformanceError`) remain unchanged.

**Migration**: Code that catches `MfeVersionMismatchError` should be removed. Version mismatches are no longer an error condition — the MFE loads its own bundled copy and functions normally.
