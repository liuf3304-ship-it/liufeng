// profile/partners.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    activeTab: 'current',
    currentPartners: [],
    historyPartners: []
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新搭子信息
    if (this.data.isLoggedIn) {
      this.getPartners();
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
      activeTab: tab
    });
  },

  // 获取搭子列表
  getPartners() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/partners/my`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            currentPartners: res.data.data || [],
            historyPartners: []
          });
        }
      },
      fail: (err) => {
        console.error('获取搭子列表失败:', err);
      }
    });
  },

  // 发起聊天
  chatWithPartner(e) {
    const partnerId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/chat/chat?partnerId=${partnerId}`
    });
  },

  // 查看搭子统计
  viewPartnerStats(e) {
    const partnerId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '统计功能开发中',
      icon: 'none'
    });
  },

  // 解除搭子关系
  dissolvePartner(e) {
    const partnerId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '解除关系',
      content: '确定要解除与该搭子的关系吗？',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token');
          wx.request({
            url: `${app.globalData.apiBaseUrl}/partners/${partnerId}`,
            method: 'DELETE',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({
                  title: '关系已解除',
                  icon: 'success',
                  duration: 2000
                });
                // 刷新搭子列表
                this.getPartners();
              } else {
                wx.showToast({
                  title: res.data.msg || '解除失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('解除搭子关系失败:', err);
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 再次匹配
  matchAgain(e) {
    wx.showToast({
      title: '跳转到匹配页面',
      icon: 'success',
      duration: 1500
    });
    wx.navigateTo({
      url: '/pages/match/match'
    });
  },

  // 去匹配搭子
  goToMatch() {
    wx.navigateTo({
      url: '/pages/match/match'
    });
  }
});