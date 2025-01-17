# Outerbase Studio Desktop

[Outerbase Studio Desktop](https://github.com/outerbase/studio-desktop) is a lightweight Electron wrapper for the [Outerbase Studio](https://github.com/outerbase/studio) web version. It enables support for drivers that aren't feasible in a browser environment, such as MySQL and PostgreSQL.

## Building (macOS)

### Prerequisites

- `macOS` >= 11.6.0
- `Xcode` >= 13
- `Python` >= 3.7
- [`node.js`](https://nodejs.org)

[Read more: Electron build instructions](https://www.electronjs.org/docs/latest/development/build-instructions-macos)

### Notarization

By default, notarization step is __enabled__. You can opt-out of notarization by commenting out the following line in `electron-builder.json5`:

```json5
afterSign: "scripts/notarize.cjs",
```

#### Environment Variables

The following environment variables are expected for the [electron notary tool](https://github.com/electron/notarize):

- `APPLE_ID` : The login username of your [Apple Developer](https://developer.apple.com/) account
 
- `APPLE_APP_SPECIFIC_PASSWORD` : An [app-specific password](https://support.apple.com/en-us/102654) for your Apple ID (not your Apple ID password)

- `APPLE_TEAM_ID` : The [Team ID](https://developer.apple.com/help/account/manage-your-team/locate-your-team-id/) for the Developer Team you want to notarize under. (Your Apple ID may be a member of multiple teams)

If they are absent, you may get the following error thrown: `No authentication properties provided`


[Read more: Resolving common notarization issues](https://developer.apple.com/documentation/security/resolving-common-notarization-issues#3087721)

### Steps

```bash
# If you don't have node.js installed yet
brew install node
```

```bash
# Install dependencies
npm install
```

```bash
# For notarization - set env variables
export APPLE_ID=...
export APPLE_TEAM_ID=...
export APPLE_APP_SPECIFIC_PASSWORD=...

# Run the build script (it should default to build:mac)
npm run build
```

### Build Output

The app will be generated under `release` and version subfolder (e.g. `release/0.1.23`):

- `mac-unversal/Outerbase Studio.app`
- `outerbase-mac-x.x.x.dmg` - DMG installer
- `outerbase-mac-x.x.x.zip` - ZIP containing the app
