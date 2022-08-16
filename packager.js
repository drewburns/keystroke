const packager = require('electron-packager');

packager({
  dir: 'release/app',

  osxSign: {
    identity: 'Developer ID Application: Andrew Burns (92VN998L5W)',
    'hardened-runtime': true,
    entitlements: 'entitlements.mac.plist',
    'entitlements-inherit': 'entitlements.mac.plist',
    'signature-flags': 'library',
  },
  osxNotarize: {
    ascProvider: '92VN998L5W',
    appleId: 'realandrewburns@icloud.com',
    appleIdPassword: 'lgkc-udvn-dvah-zmbi',
  },
});
