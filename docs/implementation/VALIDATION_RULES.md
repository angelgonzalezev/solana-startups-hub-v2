# Validation Rules

## Agent Context Guide

Open this file when implementing forms, field validation, draft requirements, verification requirements, or publication eligibility. This is the authority for what blocks save/request verification/publish actions.

Related files:

- Data fields: `docs/implementation/DATA_MODELS.md`
- Startup form screen behavior: `docs/implementation/IMPLEMENTATION_BLUEPRINT.md`
- Service methods that enforce validation: `docs/implementation/SERVICES_CONTRACTS.md`

## Profile

| Field            | Rule                                                        |
| :--------------- | :---------------------------------------------------------- |
| `displayName`    | Required for minimum profile. 2-80 characters.              |
| `jobTitle`       | Required for minimum profile. 2-80 characters.              |
| `twitterHandle`  | Optional; if present, must be valid handle or X URL.        |
| `telegramHandle` | Optional; if present, must be valid handle or Telegram URL. |
| `avatar`         | Optional uploaded JPG, PNG, or WebP; maximum 2 MB.          |
| `bio`            | Optional.                                                   |

Minimum profile:

- `displayName`
- `jobTitle`

Recommended profile:

- Minimum profile.
- `bio`.
- `avatar`.
- At least one of X or Telegram.

## Startup

| Field         | Rule                                               |
| :------------ | :------------------------------------------------- |
| `name`        | Required. 2-80 characters.                         |
| `oneLiner`    | Required. Max 160 characters.                      |
| `description` | Required for verification. 200-2000 characters.    |
| `website`     | Required for verification. Valid URL.              |
| `twitter`     | Required for verification. Valid X handle or URL.  |
| `discord`     | Optional. Valid URL if present.                    |
| `github`      | Optional. Valid URL if present.                    |
| `category`    | Required for verification. 1-5 options.            |
| `techStack`   | Required for verification. 1-10 options.           |
| `mrr`         | Optional. Non-negative number.                     |
| `teamSize`    | Required. Minimum 1.                               |
| `logo`        | Optional uploaded JPG, PNG, or WebP; maximum 2 MB. |

Uploaded avatars and logos are cropped to 1:1 and stored as 512x512 WebP images. The database keeps the Storage object path. Existing absolute image URLs remain readable but can only be replaced or removed through the upload control.

Draft minimum:

- `name`
- `oneLiner`
- `stage`

Verification minimum:

- `name`
- `oneLiner`
- `description`
- `website`
- `twitter`
- `stage`
- `category`
- `techStack`
- `teamSize`

Publication requires:

- Verification minimum.
- `verificationStatus = verified`.
- `listingStatus = published`.
- Existing owner user.
