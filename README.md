# NOVA

NOVA is the desktop creative studio by NOVA TECH.

## First milestone
- macOS desktop shell (Intel x64 and Apple Silicon)
- Turkish-first interface
- Project areas for research, scripts, media, video production and YouTube
- YouTube publishing requires explicit user approval; public publishing is never automatic

## Development
Requires Node.js 20+.

```bash
npm install
npm start
```

## macOS installer
```bash
npm run dist:mac
```

The app is currently an unsigned development build. macOS may show a security warning until the app is code-signed and notarized with an Apple Developer account.

## Product integration notes
Meta Muse video generation is not assumed to have a supported public API. The first integration will create exportable prompts and support importing clips generated in the official Muse interface. Never store API keys in source control.