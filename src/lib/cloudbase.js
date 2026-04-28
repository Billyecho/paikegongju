import cloudbase from '@cloudbase/js-sdk'

const cloudbaseEnvId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const cloudbasePublishableKey = import.meta.env.VITE_CLOUDBASE_PUBLISHABLE_KEY
const cloudbaseRegion = import.meta.env.VITE_CLOUDBASE_REGION

export const isCloudbaseConfigured = Boolean(cloudbaseEnvId && cloudbasePublishableKey)

export const cloudbaseApp = isCloudbaseConfigured
  ? cloudbase.init({
      env: cloudbaseEnvId,
      region: cloudbaseRegion || undefined,
      accessKey: cloudbasePublishableKey,
      auth: {
        detectSessionInUrl: true,
      },
    })
  : null

export const cloudbaseAuth = cloudbaseApp ? cloudbaseApp.auth() : null
export const cloudbaseDb = cloudbaseApp ? cloudbaseApp.database() : null

export function getCloudbaseUserId(user) {
  return user?.uid || user?.id || user?.username || user?.email || ''
}
