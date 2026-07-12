// Metro config — on the WEB platform only, swap native-only modules
// (Chromecast, WireGuard) for lightweight stubs so the app also runs in a
// browser (used for screenshots/demos). Android/iOS are unaffected.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const WEB_STUBS = {
  'react-native-google-cast': path.resolve(__dirname, 'web-stubs/google-cast.js'),
  'react-native-wireguard-vpn': path.resolve(__dirname, 'web-stubs/wireguard.js'),
};

const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && WEB_STUBS[moduleName]) {
    return { type: 'sourceFile', filePath: WEB_STUBS[moduleName] };
  }
  return (defaultResolve || context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
