class FreightService {
  constructor() {
    // 抛比系数
    this.volumeWeightRatio = 6000
    // 基础运费（每50公里6元）
    this.baseFreight = 6
    this.baseDistance = 50000 // 50公里，单位：米
    // 司机分成比例（83.33%）
    this.driverShareRatio = 0.8333
  }

  // 计算体积（立方厘米）
  calculateVolume(length, width, height) {
    return length * width * height
  }

  // 计算体积重（千克）
  calculateVolumeWeight(volume) {
    return volume / this.volumeWeightRatio
  }

  // 计算计费重量（取体积重和实际重量的较大值）
  calculateChargeableWeight(actualWeight, volumeWeight) {
    return Math.max(actualWeight, volumeWeight)
  }

  // 计算基础运费
  calculateBaseFreight(distance) {
    return Math.ceil(distance / this.baseDistance) * this.baseFreight
  }

  // 计算重量附加费
  calculateWeightSurcharge(chargeableWeight) {
    // 每增加1千克增加0.1元
    return Math.max(0, (chargeableWeight - 1) * 0.1)
  }

  // 计算总运费
  calculateTotalFreight(params) {
    const {
      length, // 长（厘米）
      width,  // 宽（厘米）
      height, // 高（厘米）
      weight, // 实际重量（千克）
      distance // 距离（米）
    } = params

    // 计算体积和体积重
    const volume = this.calculateVolume(length, width, height)
    const volumeWeight = this.calculateVolumeWeight(volume)
    
    // 计算计费重量
    const chargeableWeight = this.calculateChargeableWeight(weight, volumeWeight)
    
    // 计算基础运费
    const baseFreight = this.calculateBaseFreight(distance)
    
    // 计算重量附加费
    const weightSurcharge = this.calculateWeightSurcharge(chargeableWeight)
    
    // 总运费 = 基础运费 + 重量附加费
    const totalFreight = baseFreight + weightSurcharge

    return {
      volume,           // 体积（立方厘米）
      volumeWeight,     // 体积重（千克）
      chargeableWeight, // 计费重量（千克）
      baseFreight,      // 基础运费（元）
      weightSurcharge,  // 重量附加费（元）
      totalFreight      // 总运费（元）
    }
  }

  // 计算司机收益
  calculateDriverEarnings(totalFreight) {
    return Math.floor(totalFreight * this.driverShareRatio * 100) / 100
  }

  // 获取预估运费
  async getEstimatedFreight(params) {
    const { origin, destination, packages } = params
    
    try {
      // 计算总体积和总重量
      const totalVolume = packages.reduce((sum, pkg) => {
        return sum + this.calculateVolume(pkg.length, pkg.width, pkg.height)
      }, 0)
      
      const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0)
      
      // 获取距离
      const distance = await this.getDistance(origin, destination)
      
      // 计算运费
      const result = this.calculateTotalFreight({
        length: Math.cbrt(totalVolume), // 将总体积转换为立方体的边长
        width: Math.cbrt(totalVolume),
        height: Math.cbrt(totalVolume),
        weight: totalWeight,
        distance
      })

      return {
        ...result,
        distance,
        driverEarnings: this.calculateDriverEarnings(result.totalFreight)
      }
    } catch (error) {
      console.error('预估运费计算失败:', error)
      throw error
    }
  }

  // 获取两点间距离（需要高德地图支持）
  async getDistance(origin, destination) {
    // 如果已经有具体距离，直接返回
    if (typeof origin === 'number') {
      return origin
    }
    
    // 否则调用高德地图计算距离
    const AMapService = (await import('./amap')).default
    return AMapService.calculateDistance(origin, destination)
  }
}

export default new FreightService() 