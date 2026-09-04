# Modernisering 2026

This fork modernizes the deployment of Google-Scoutnet-synk while keeping the existing Scoutnet and Google Admin SDK integration intact.

## Changes

- Adds a fail-closed Scoutnet preflight before the combined user/group synchronization.
- Adds a read-only `kontrolleraScoutnetSynkronisering()` preflight function.
- Moves Scoutnet API keys out of `Konfiguration.gs` and into Apps Script Script Properties.
- Removes the example/test domain and example API keys from the configuration template.
- Disables contact synchronization by default. The legacy contact-group authentication implementation should not be enabled without further redesign.
- Updates the combined entry point to `synkroniseraAnvandareOchGrupperSakert()`.

## Required Script Properties

Set these in Apps Script under **Project Settings → Script Properties**:

- `SCOUTNET_API_KEY_LIST_ALL`
- `SCOUTNET_API_KEY_MAILINGLISTS`
- `MIN_EXPECTED_MEMBERS` (recommended; set this to a sensible minimum for the organisation)

Do not put API keys in source control.

## Configuration

Set at minimum:

- `KONFIG_OBJECT.DOMAIN`
- `KONFIG_OBJECT.SCOUTNET_GROUP_ID`
- `KONFIG_OBJECT.USER_ACCOUNT_CONFIG`

The default configuration intentionally has no account lists configured. This prevents a fresh deployment from creating accounts until the administrator explicitly configures the Scoutnet lists.

## Safe operation

Use `kontrolleraScoutnetSynkronisering()` first. It performs only the Scoutnet read/preflight.

Use `synkroniseraAnvandareOchGrupper()` for the combined synchronization. It now performs the preflight before invoking the existing synchronization engine.

The legacy `synkroniseraAnvandare()` entry point remains available for compatibility. For production automation, prefer the safe combined entry point.

## Not yet migrated

The following legacy areas are deliberately not silently rewritten:

- Contact-group password authentication and password recovery by email.
- The large Drive migration utilities.
- Existing Google Groups policy synchronization.

These should be handled as separate modernization work because changing them can alter existing deployments and permissions.
