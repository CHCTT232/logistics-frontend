import store from '@/store'

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = 3000
  }

  // 初始化 WebSocket 连接
  init() {
    const token = localStorage.getItem('token')
    if (!token) return

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}/ws?token=${token}`
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = this.onOpen.bind(this)
    this.ws.onmessage = this.onMessage.bind(this)
    this.ws.onclose = this.onClose.bind(this)
    this.ws.onerror = this.onError.bind(this)
  }

  // WebSocket 连接成功
  onOpen() {
    console.log('WebSocket 连接成功')
    this.reconnectAttempts = 0
    
    // 定期发送心跳包
    this.heartbeat = setInterval(() => {
      this.send({ type: 'heartbeat' })
    }, 30000)
  }

  // 处理接收到的消息
  onMessage(event) {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'package_status_update':
          // 更新包裹状态
          store.dispatch('package/getPackageDetail', data.packageId)
          break
          
        case 'new_delivery_task':
          // 刷新可用配送任务
          store.dispatch('route/getAvailableTasks')
          break
          
        case 'driver_location_update':
          // 更新司机位置
          store.commit('route/SET_DRIVER_LOCATION', data.location)
          break
          
        case 'notification':
          // 显示通知
          store.dispatch('notification/show', data.message)
          break
      }
    } catch (error) {
      console.error('WebSocket 消息处理错误:', error)
    }
  }

  // WebSocket 连接关闭
  onClose() {
    console.log('WebSocket 连接关闭')
    clearInterval(this.heartbeat)
    
    // 尝试重新连接
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.init()
      }, this.reconnectTimeout)
    }
  }

  // WebSocket 连接错误
  onError(error) {
    console.error('WebSocket 错误:', error)
  }

  // 发送消息
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  // 关闭连接
  close() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

export default new WebSocketService() 