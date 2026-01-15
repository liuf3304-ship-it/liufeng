// achievement.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    achievements: [],
    completedCount: 0,
    totalCount: 0,
    activeTab: 'all',
    isLoading: true
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新成就数据
    if (this.data.isLoggedIn) {
      this.getAchievements();
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

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      isLoading: true
    });
    this.getAchievements();
  },

  // 获取成就列表
  getAchievements() {
    const token = wx.getStorageSync('token');
    const { activeTab } = this.data;

    wx.request({
      url: `${app.globalData.apiBaseUrl}/achievements?status=${activeTab}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          const achievements = res.data.data;
          const completedCount = achievements.filter(item => item.isCompleted).length;
          const totalCount = achievements.length;
          
          this.setData({
            achievements: achievements,
            completedCount: completedCount,
            totalCount: totalCount,
            isLoading: false
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取成就失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取成就失败:', err);
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

  // 同步成就进度
  syncAchievements() {
    const token = wx.getStorageSync('token');
    
    wx.showLoading({
      title: '同步中...',
      mask: true
    });
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/achievements/sync`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.code === 0) {
          const achievements = res.data.data;
          const completedCount = achievements.filter(item => item.isCompleted).length;
          const totalCount = achievements.length;
          
          this.setData({
            achievements: achievements,
            completedCount: completedCount,
            totalCount: totalCount
          });
          
          wx.showToast({
            title: '同步成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.msg || '同步失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('同步成就失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 跳转到成就详情页
  goToAchievementDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/achievement/detail?id=${id}`
    });
  }
});