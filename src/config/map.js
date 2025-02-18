export const MAP_CONFIG = {
  key: import.meta.env.VITE_AMAP_KEY || '1c002838c5e6fbd5f968b0024e6b3485',
  version: '2.0',
  plugins: [
    'AMap.ToolBar',
    'AMap.Scale',
    'AMap.HawkEye',
    'AMap.MapType',
    'AMap.Driving',
    'AMap.Geocoder',
    'AMap.Marker',
    'AMap.Polyline',
    'AMap.Icon'
  ],
  securityConfig: {
    securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE || '2e0c1e3f6c9a8b7d4e1f0a2c5b4d3e6a'
  },
  AMapUI: {
    version: '1.1',
    plugins: []
  },
  AMapJS: {
    src: `https://webapi.amap.com/maps?v=2.0&key=${import.meta.env.VITE_AMAP_KEY || '1c002838c5e6fbd5f968b0024e6b3485'}`
  }
} 