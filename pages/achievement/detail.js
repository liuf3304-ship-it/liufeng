// detail.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    achievementId: '',
    achievement: {},
    isLoading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        achievementId: options.id
      });
      // 检查登录状态
      this.checkLoginStatus();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      wx.navigateBack();
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
    } else {
      // 获取成就详情
      this.getAchievementDetail();
    }
  },

  // 获取成就详情
  getAchievementDetail() {
    const token = wx.getStorageSync('token');
    const { achievementId } = this.data;

    wx.request({
      url: `${app.globalData.apiBaseUrl}/achievements/${achievementId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            achievement: res.data.data,
            isLoading: false
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取成就详情失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取成就详情失败:', err);
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

  // 返回成就列表
  goBack() {
    wx.navigateBack();
  }
});