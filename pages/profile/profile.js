// profile.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    userStats: {},
    notificationCount: 0
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时更新数据
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.getUserInfo();
      this.getUserStats();
      this.getNotificationCount();
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

  // 获取用户信息
  getUserInfo() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/profile`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            userInfo: res.data.data
          });
          // 更新全局用户信息
          app.globalData.userInfo = res.data.data;
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
      }
    });
  },

  // 获取用户统计数据
  getUserStats() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/stats`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            userStats: res.data.data
          });
        }
      },
      fail: (err) => {
        console.error('获取用户统计数据失败:', err);
      }
    });
  },

  // 获取未读消息数量
  getNotificationCount() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/notifications/unread-count`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            notificationCount: res.data.data
          });
        }
      },
      fail: (err) => {
        console.error('获取未读消息数量失败:', err);
      }
    });
  },

  // 跳转到个人信息页面
  goToUserInfo() {
    wx.navigateTo({
      url: '/pages/profile/info'
    });
  },

  // 跳转到我的搭子页面
  goToPartners() {
    wx.navigateTo({
      url: '/pages/profile/partners'
    });
  },

  // 跳转到打卡页面
  goToCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/checkin'
    });
  },

  // 跳转到消息通知页面
  goToNotifications() {
    wx.navigateTo({
      url: '/pages/profile/notification'
    });
  },

  // 跳转到押金管理页面
  goToDeposit() {
    wx.navigateTo({
      url: '/pages/profile/deposit'
    });
  },

  // 跳转到成就页面
  goToAchievements() {
    wx.navigateTo({
      url: '/pages/achievement/achievement'
    });
  },

  // 跳转到数据复盘页面
  goToDataAnalysis() {
    wx.navigateTo({
      url: '/pages/dataAnalysis/dataAnalysis'
    });
  },

  // 跳转到设置页面
  goToSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  },

  // 显示关于我们
  showAbout() {
    wx.showModal({
      title: '关于备考搭子',
      content: '备考搭子 V1.0\n\n专注于为备考用户提供学习搭子匹配、打卡监督、学习统计等功能。\n\n© 2026 备考搭子团队',
      showCancel: false
    });
  },

  // 跳转到意见反馈页面
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的token
          wx.removeStorageSync('token');
          // 更新全局登录状态
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;
          // 跳转到登录页面
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});