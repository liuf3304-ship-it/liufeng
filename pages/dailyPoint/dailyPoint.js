// dailyPoint.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    todayPoint: null,
    isLoading: false,
    isCollected: false
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新数据
    if (this.data.isLoggedIn) {
      this.getTodayPoint();
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

  // 获取今日考点
  getTodayPoint() {
    this.setData({
      isLoading: true
    });

    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/daily-point/today`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            todayPoint: res.data.data,
            isLoading: false
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取今日考点失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取今日考点失败:', err);
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

  // 收藏考点
  collectPoint() {
    wx.showToast({
      title: '收藏功能开发中',
      icon: 'none'
    });
  },

  // 加入错题本
  addToErrorBook() {
    if (!this.data.todayPoint) return;
    
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/errorbook`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        questionId: this.data.todayPoint.questionId || '',
        errorReason: '从每日考点添加',
        shareStatus: false
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '已加入错题本',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.msg || '加入错题本失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加入错题本失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到往期考点列表
  goToPastPoints() {
    wx.showToast({
      title: '往期考点功能开发中',
      icon: 'none'
    });
  }
});