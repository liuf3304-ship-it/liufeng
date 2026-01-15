// dataAnalysis.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    dataAnalysis: null,
    isLoading: false,
    timeRange: '30', // 时间范围，默认30天
    selectedChart: 'checkin' // 默认显示打卡趋势
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新数据
    if (this.data.isLoggedIn) {
      this.getDataAnalysis();
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn
    });

    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },

  // 获取个人数据复盘
  getDataAnalysis() {
    this.setData({
      isLoading: true
    });

    const token = wx.getStorageSync('token');
    const timeRange = this.data.timeRange;

    wx.request({
      url: `${app.globalData.apiBaseUrl}/data-analysis/personal`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        timeRange
      },
      success: (res) => {
        if (res.data.code === 0) {
          let dataAnalysis = res.data.data;
          
          // 计算模考最高分并标记
          if (dataAnalysis.examScoreTrend && dataAnalysis.examScoreTrend.length > 0) {
            const maxScore = Math.max(...dataAnalysis.examScoreTrend.map(item => item.score));
            dataAnalysis.examScoreTrend = dataAnalysis.examScoreTrend.map(item => ({
              ...item,
              isHighest: item.score === maxScore
            }));
          }
          
          this.setData({
            dataAnalysis: dataAnalysis,
            isLoading: false
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取数据复盘失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取数据复盘失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        this.setData({
          isLoading: false
        });
      }
    });
  },

  // 切换时间范围
  onTimeRangeChange(e) {
    const timeRange = e.currentTarget.dataset.range;
    this.setData({
      timeRange: timeRange,
      dataAnalysis: null
    });
    this.getDataAnalysis();
  },

  // 切换图表类型
  onChartChange(e) {
    const chartType = e.currentTarget.dataset.chart;
    this.setData({
      selectedChart: chartType
    });
  },

  // 导出数据
  exportData() {
    wx.showToast({
      title: '导出功能开发中',
      icon: 'none'
    });
  },

  // 刷新数据
  refreshData() {
    this.getDataAnalysis();
  }
});