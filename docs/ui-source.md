# BLD8 UI source

Installed on 19 October 2026 through the actual shadcn CLI from the public BLD8
registry: https://ui.bld8.dev/r/button.json,
https://ui.bld8.dev/r/dialog.json and https://ui.bld8.dev/r/tabs.json.

The registry resolved the shared core, controls, overlays, icons, state, utility
and variant modules, compiled CSS and five licence/notice files. It installed
exact runtime dependencies in the application manifest. The application uses
those editable modules directly; there is no sibling package or absolute-path
dependency and no BLD8 package needs to be published to npm.

The three installed CSS files match the canonical library output byte for byte.
The currently verified UI release source is 1e32738. SHA-256 fingerprints:

- styles.css: `0275520e888452ff79d42fb35e8bfc4ceb50d6ee378a858f08c3bcb8223ca47b`
- tokens.css: `c372105dc1841f927e3a95cce7afbda4f3f0a573a48e9333502b0719bbb4f405`
- tailwind.css: `fd5aef093d14e1ee3dd4cabe190efcfdb9e06580d7c44a986d35b7b3bc7e7576`


Keep the MIT, Lucide, day-picker, shadcn and third-party notices in the installed
licences directory. Future updates should review registry overwrite prompts and
re-run the application checks. Reusable fixes belong in the canonical library;
application layout and sample behaviour remain Workbench code.

Application branding is now supplied through separate theme overrides; see
[Workbench theming](theming.md). All eighteen installed files above remain unchanged.
