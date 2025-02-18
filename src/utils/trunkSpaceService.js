class TrunkSpaceService {
  constructor() {
    // 默认后备箱尺寸（单位：厘米）
    this.defaultTrunkSize = {
      length: 100,
      width: 80,
      height: 50
    }
  }

  // 分析后备箱照片
  async analyzeTrunkPhoto(photo) {
    try {
      // 将照片转为 FormData
      const formData = new FormData()
      formData.append('photo', photo)

      // 调用后端 AI 分析接口
      const response = await fetch('/api/trunk/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('后备箱照片分析失败')
      }

      const result = await response.json()
      return {
        length: result.length,
        width: result.width,
        height: result.height,
        volume: result.length * result.width * result.height,
        usableSpace: result.usableSpace // 可用空间（立方厘米）
      }
    } catch (error) {
      console.error('后备箱照片分析失败:', error)
      // 如果分析失败，返回默认尺寸
      return {
        ...this.defaultTrunkSize,
        volume: this.defaultTrunkSize.length * this.defaultTrunkSize.width * this.defaultTrunkSize.height,
        usableSpace: this.defaultTrunkSize.length * this.defaultTrunkSize.width * this.defaultTrunkSize.height * 0.8 // 默认可用空间为80%
      }
    }
  }

  // 计算包裹体积
  calculatePackageVolume(pkg) {
    return pkg.length * pkg.width * pkg.height
  }

  // 检查包裹是否能放入指定空间
  canFitInSpace(pkg, space) {
    // 考虑包裹的六种放置方向
    const rotations = [
      [pkg.length, pkg.width, pkg.height],
      [pkg.length, pkg.height, pkg.width],
      [pkg.width, pkg.length, pkg.height],
      [pkg.width, pkg.height, pkg.length],
      [pkg.height, pkg.length, pkg.width],
      [pkg.height, pkg.width, pkg.length]
    ]

    // 检查是否有任何一种放置方式可行
    return rotations.some(([l, w, h]) => {
      return l <= space.length && w <= space.width && h <= space.height
    })
  }

  // 优化包裹摆放（使用三维装箱算法）
  optimizePackagePlacement(packages, trunkSpace) {
    // 按体积从大到小排序包裹
    const sortedPackages = [...packages].sort((a, b) => {
      return this.calculatePackageVolume(b) - this.calculatePackageVolume(a)
    })

    const placement = {
      success: true,
      packages: [],
      remainingSpace: { ...trunkSpace }
    }

    // 尝试放置每个包裹
    for (const pkg of sortedPackages) {
      if (!this.canFitInSpace(pkg, placement.remainingSpace)) {
        placement.success = false
        break
      }

      // 计算放置后的剩余空间
      const pkgVolume = this.calculatePackageVolume(pkg)
      placement.remainingSpace.usableSpace -= pkgVolume
      placement.packages.push({
        ...pkg,
        volume: pkgVolume
      })
    }

    return placement
  }

  // 计算剩余空间
  calculateRemainingSpace(trunkSpace, placedPackages) {
    const totalPackageVolume = placedPackages.reduce((sum, pkg) => {
      return sum + this.calculatePackageVolume(pkg)
    }, 0)

    return {
      ...trunkSpace,
      usableSpace: trunkSpace.usableSpace - totalPackageVolume
    }
  }

  // 检查是否可以添加新包裹
  canAddPackage(newPackage, trunkSpace, existingPackages = []) {
    const allPackages = [...existingPackages, newPackage]
    const placement = this.optimizePackagePlacement(allPackages, trunkSpace)
    return placement.success
  }

  // 获取最佳装载方案
  getBestLoadingPlan(packages, trunkSpace) {
    const placement = this.optimizePackagePlacement(packages, trunkSpace)
    
    if (!placement.success) {
      return {
        success: false,
        message: '部分包裹无法装入后备箱',
        fittingPackages: placement.packages,
        remainingSpace: placement.remainingSpace
      }
    }

    return {
      success: true,
      packages: placement.packages,
      remainingSpace: placement.remainingSpace,
      utilizationRate: (1 - placement.remainingSpace.usableSpace / trunkSpace.usableSpace) * 100
    }
  }
}

export default new TrunkSpaceService() 