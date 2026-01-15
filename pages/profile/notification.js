// profile/notification.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    notifications: [],
    page: 1,
    limit: 10,
    hasMore: true,
    isLoading: false
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新通知列表
    if (this.data.isLoggedIn) {
      this.resetPage();
      this.getNotifications();
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

  // 重置分页
  resetPage() {
    this.setData({
      page: 1,
      notifications: [],
      hasMore: true
    });
  },

  // 获取通知列表
  getNotifications() {
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }

    this.setData({
      isLoading: true
    });

    const token = wx.getStorageSync('token');
    const { page, limit } = this.data;

    wx.request({
      url: `${app.globalData.apiBaseUrl}/notifications`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        page: page,
        limit: limit
      },
      success: (res) => {
        if (res.data.code === 0) {
          const notifications = res.data.data.list;
          const newNotifications = page === 1 ? notifications : [...this.data.notifications, ...notifications];
          
          this.setData({
            notifications: newNotifications,
            hasMore: notifications.length === limit,
            page: page + 1
          });
        }
      },
      fail: (err) => {
        console.error('获取通知列表失败:', err);
      },
      complete: () => {
        this.setData({
          isLoading: false
        });
      }
    });
  },

  // 标记通知为已读
  markAsRead(notificationId) {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/notifications/${notificationId}/read`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          // 更新本地通知状态
          const notifications = this.data.notifications.map(notification => {
            if (notification.id === notificationId) {
              return {
                ...notification,
                isRead: true
              };
            }
            return notification;
          });
          this.setData({
            notifications: notifications
          });
        }
      },
      fail: (err) => {
        console.error('标记通知已读失败:', err);
      }
    });
  },

  // 标记全部已读
  markAllAsRead() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/notifications/read-all`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          // 更新本地所有通知状态
          const notifications = this.data.notifications.map(notification => ({
            ...notification,
            isRead: true
          }));
          this.setData({
            notifications: notifications
          });
          wx.showToast({
            title: '全部已标记为已读',
            icon: 'success'
          });
        }
      },
      fail: (err) => {
        console.error('标记全部已读失败:', err);
        wx.showToast({
          title: '操作失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 清空全部消息
  clearAllNotifications() {
    wx.showModal({
      title: '清空消息',
      content: '确定要清空所有消息吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token');

          wx.request({
            url: `${app.globalData.apiBaseUrl}/notifications/clear`,
            method: 'DELETE',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.code === 0) {
                this.setData({
                  notifications: []
                });
                wx.showToast({
                  title: '消息已清空',
                  icon: 'success'
                });
              }
            },
            fail: (err) => {
              console.error('清空消息失败:', err);
              wx.showToast({
                title: '操作失败，请稍后重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 处理通知操作
  handleAction(e) {
    const { id, action } = e.currentTarget.dataset;
    console.log(`处理通知 ${id} 的操作: ${action}`);
    // 根据不同操作类型执行相应逻辑
    switch (action) {
      case '接受':
        this.acceptRequest(id);
        break;
      case '拒绝':
        this.rejectRequest(id);
        break;
      case '查看':
        this.viewDetails(id);
        break;
      default:
        break;
    }
  },

  // 接受请求
  acceptRequest(notificationId) {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/notifications/${notificationId}/accept`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '操作成功',
            icon: 'success'
          });
          // 刷新通知列表
          this.resetPage();
          this.getNotifications();
        } else {
          wx.showToast({
            title: res.data.msg || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('接受请求失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 拒绝请求
  rejectRequest(notificationId) {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/notifications/${notificationId}/reject`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '操作成功',
            icon: 'success'
          });
          // 刷新通知列表
          this.resetPage();
          this.getNotifications();
        } else {
          wx.showToast({
            title: res.data.msg || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('拒绝请求失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 查看详情
  viewDetails(notificationId) {
    // 根据通知类型跳转到不同页面
    wx.showToast({
      title: '查看详情功能开发中',
      icon: 'none'
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.resetPage();
    this.getNotifications();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    this.getNotifications();
  }
});