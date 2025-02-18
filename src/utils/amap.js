class AMapService {
  constructor() {
    this.map = null
    this.markers = new Map()
    this.driving = null
    this.key = import.meta.env.VITE_AMAP_KEY
  }

  // 初始化地图
  async initMap(container, options = {}) {
    if (!window.AMap) {
      await this.loadAMapScript()
    }

    const defaultOptions = {
      zoom: 11,
      center: [116.397428, 39.90923],
      viewMode: '3D'
    }

    this.map = new window.AMap.Map(container, { ...defaultOptions, ...options })
    
    // 添加控件
    this.map.addControl(new window.AMap.Scale())
    this.map.addControl(new window.AMap.ToolBar())
    
    // 初始化路线规划插件
    this.driving = new window.AMap.Driving({
      map: this.map,
      panel: 'panel'
    })

    return this.map
  }

  // 动态加载高德地图脚本
  loadAMapScript() {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${this.key}&plugin=AMap.Scale,AMap.ToolBar,AMap.Driving,AMap.Geocoder`
      
      script.onerror = reject
      script.onload = () => {
        resolve()
      }

      document.head.appendChild(script)
    })
  }

  // 添加标记点
  addMarker(location, options = {}) {
    const marker = new window.AMap.Marker({
      position: location,
      map: this.map,
      ...options
    })

    if (options.id) {
      this.markers.set(options.id, marker)
    }

    return marker
  }

  // 移除标记点
  removeMarker(id) {
    const marker = this.markers.get(id)
    if (marker) {
      marker.setMap(null)
      this.markers.delete(id)
    }
  }

  // 规划路线
  planRoute(origin, destination, waypoints = []) {
    return new Promise((resolve, reject) => {
      this.driving.search(
        origin,
        destination,
        {
          waypoints
        },
        (status, result) => {
          if (status === 'complete') {
            resolve(result)
          } else {
            reject(new Error('路线规划失败'))
          }
        }
      )
    })
  }

  // 绘制路径
  drawPath(path, options = {}) {
    const polyline = new window.AMap.Polyline({
      path,
      strokeColor: '#3366FF',
      strokeWeight: 6,
      strokeOpacity: 0.8,
      ...options
    })

    polyline.setMap(this.map)
    return polyline
  }

  // 地理编码（地址转坐标）
  geocoder(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new window.AMap.Geocoder()
      geocoder.getLocation(address, (status, result) => {
        if (status === 'complete' && result.geocodes.length) {
          resolve(result.geocodes[0].location)
        } else {
          reject(new Error('地理编码失败'))
        }
      })
    })
  }

  // 逆地理编码（坐标转地址）
  reverseGeocoder(location) {
    return new Promise((resolve, reject) => {
      const geocoder = new window.AMap.Geocoder()
      geocoder.getAddress(location, (status, result) => {
        if (status === 'complete') {
          resolve(result.regeocode)
        } else {
          reject(new Error('逆地理编码失败'))
        }
      })
    })
  }

  // 计算两点间距离（米）
  calculateDistance(point1, point2) {
    return window.AMap.GeometryUtil.distance(point1, point2)
  }

  // 设置地图中心点和缩放级别
  setView(center, zoom) {
    this.map.setZoomAndCenter(zoom, center)
  }

  // 销毁地图
  destroy() {
    if (this.map) {
      this.map.destroy()
      this.map = null
      this.markers.clear()
      this.driving = null
    }
  }
}

export default new AMapService() 