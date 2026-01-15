// checkin.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    currentDate: '',
    hasCheckedIn: false,
    checkinTime: '',
    studyHours: '',
    content: '',
    isShared: false,
    isSubmitting: false,
    checkinDays: 0,
    totalCheckins: 0,
    recentCheckins: []
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
    // 更新当前日期
    this.updateCurrentDate();
  },

  onShow() {
    // 每次显示页面时检查登录状态和打卡状态
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.getTodayCheckinStatus();
      this.getRecentCheckins();
      this.getCheckinStats();
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

  // 更新当前日期
  updateCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    this.setData({
      currentDate: `${year}-${month}-${day}`
    });
  },

  // 获取今日打卡状态
  getTodayCheckinStatus() {
    // 通过获取最近的打卡记录来判断今日是否已打卡
    this.getRecentCheckins(true);
  },

  // 获取打卡统计数据
  getCheckinStats() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/stats`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            checkinDays: res.data.data.checkinDays,
            totalCheckins: res.data.data.checkinDays
          });
        }
      },
      fail: (err) => {
        console.error('获取打卡统计失败:', err);
      }
    });
  },

  // 获取近期打卡记录
  getRecentCheckins(checkTodayStatus = false) {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/checkins/my`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        page: 1,
        limit: checkTodayStatus ? 1 : 5
      },
      success: (res) => {
        if (res.data.code === 0) {
          const checkins = res.data.data.list || [];
          if (checkTodayStatus) {
            // 检查今日是否已打卡
            const today = this.data.currentDate;
            const hasCheckedIn = checkins.some(checkin => checkin.checkinDate === today);
            this.setData({
              hasCheckedIn: hasCheckedIn,
              checkinTime: hasCheckedIn ? checkins[0].checkinTime || '' : ''
            });
          } else {
            this.setData({
              recentCheckins: checkins
            });
          }
        }
      },
      fail: (err) => {
        console.error('获取近期打卡记录失败:', err);
      }
    });
  },

  // 学习时长输入变化
  onStudyHoursChange(e) {
    this.setData({
      studyHours: e.detail.value
    });
  },

  // 学习内容输入变化
  onContentChange(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 学习成果输入变化
  onAchievementChange(e) {
    this.setData({
      achievement: e.detail.value
    });
  },

  // 学习计划输入变化
  onPlanChange(e) {
    this.setData({
      plan: e.detail.value
    });
  },

  // 提交打卡
  submitCheckin(e) {
    const { studyHours, content, isShared } = this.data;

    // 表单验证
    if (!studyHours || parseFloat(studyHours) <= 0) {
      wx.showToast({
        title: '请输入有效的学习时长',
        icon: 'none'
      });
      return;
    }

    if (!content || content.trim() === '') {
      wx.showToast({
        title: '请输入今日学习内容',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isSubmitting: true
    });

    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/checkins`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        type: 'text', // 默认为文本打卡
        studyHours: parseFloat(studyHours),
        content: content.trim(),
        isShared: isShared
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '打卡成功',
            icon: 'success',
            duration: 2000
          });
          // 更新页面状态
          this.setData({
            hasCheckedIn: true,
            checkinTime: res.data.data.checkinTime,
            studyHours: '',
            content: '',
            isSubmitting: false
          });
          // 更新统计数据
          this.getCheckinStats();
          this.getRecentCheckins();
        } else {
          wx.showToast({
            title: res.data.message || '打卡失败',
            icon: 'none'
          });
          this.setData({
            isSubmitting: false
          });
        }
      },
      fail: (err) => {
        console.error('打卡失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        this.setData({
          isSubmitting: false
        });
      }
    });
  },

  // 查看打卡历史
  viewHistory() {
    wx.navigateTo({
      url: '/pages/profile/partners?type=history'
    });
  }
});