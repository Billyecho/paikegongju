import AV from 'leancloud-storage'

const APP_ID = import.meta.env.VITE_LEANCLOUD_APP_ID || 'your-app-id'
const APP_KEY = import.meta.env.VITE_LEANCLOUD_APP_KEY || 'your-app-key'

let initialized = false

export function initLeanCloud() {
  if (initialized) return
  AV.init({
    appId: APP_ID,
    appKey: APP_KEY,
    serverURL: 'https://api.leancloud.cn'
  })
  initialized = true
}

export { AV }
