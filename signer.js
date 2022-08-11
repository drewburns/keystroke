const { signAsync } = require('@electron/osx-sign');
signAsync({
  app: 'release/build/mac/Keystroke.app',
  optionsForFile: (path) => {
    return {
      entitlements: 'entitlements.mac.plist',
      hardenedRuntime: true,
    };
  },
})
  .then(function () {
    // Application signed
  })
  .catch(function (err) {
    // Handle the error
  });
