const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
const projectNodeModules = path.resolve(projectRoot, 'node_modules')
const workspaceNodeModules = path.resolve(workspaceRoot, 'node_modules')
const clerkExpoRoot = path.resolve(
  path.dirname(require.resolve('@clerk/clerk-expo', { paths: [projectRoot] })),
  '..',
)
const clerkNodeModules = path.resolve(clerkExpoRoot, 'node_modules')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.disableHierarchicalLookup = true
config.resolver.nodeModulesPaths = [
  projectNodeModules,
  // Clerk Expo and Clerk Next use different major versions of @clerk/shared.
  // Resolve the mobile SDK's private dependencies before the workspace root,
  // otherwise ClerkContextProvider receives undefined React contexts.
  clerkNodeModules,
  workspaceNodeModules,
]
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: path.resolve(projectNodeModules, 'react'),
  'react-dom': path.resolve(projectNodeModules, 'react-dom'),
  'react-native': path.resolve(projectNodeModules, 'react-native'),
  expo: path.resolve(projectNodeModules, 'expo'),
  'expo-auth-session': path.resolve(projectNodeModules, 'expo-auth-session'),
  'expo-constants': path.resolve(projectNodeModules, 'expo-constants'),
  'expo-crypto': path.resolve(projectNodeModules, 'expo-crypto'),
  'expo-linking': path.resolve(projectNodeModules, 'expo-linking'),
  'expo-router': path.resolve(projectNodeModules, 'expo-router'),
  'expo-web-browser': path.resolve(projectNodeModules, 'expo-web-browser'),
}

module.exports = config
