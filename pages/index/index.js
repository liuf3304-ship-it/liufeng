// index.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    currentDate: '',
    hasCheckedIn: false,
    checkinDays: 0,
    totalCheckins: 0,
    totalStudyHours: 0,
    totalErrorQuestions: 0,
    examAverageScore: 0,
    partnerCount: 0,
    recommendPartners: [],
    todayPoint: null,
    loading: {
      checkin: false,
      stats: false,
      partners: false,
      recentCheckins: false,
      dailyPoint: false
    }
  },

  onLoad() {
    // 初始化页面数据
    this.initData();
    // 更新当前日期
    this.updateCurrentDate();
  },

  onShow() {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus();
    // 更新页面数据
    this.initData();
  },

  // 检查登录状态
  checkLoginStatus() {
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo
    });
  },

  // 初始化页面数据
  async initData() {
    if (this.data.isLoggedIn) {
      // 并行请求，提高页面加载速度
      await Promise.all([
        this.getTodayCheckinStatus(),
        this.getStudyStats(),
        this.getRecommendPartners(),
        this.getRecentCheckins(),
        this.getTodayPoint()
      ]);
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
  async getTodayCheckinStatus() {
    try {
      this.setData({ 'loading.checkin': true });
      const token = wx.getStorageSync('token');
      const { currentDate } = this.data;
      const res = await wx.request({
        url: `${app.globalData.apiBaseUrl}/checkins/my`,
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          page: 1,
          limit: 1
        },
        method: 'GET'
      });
      
      if (res.data.code === 0) {
        const checkins = res.data.data.list || [];
        const hasCheckedIn = checkins.some(checkin => checkin.checkinDate === currentDate);
        this.setData({
          hasCheckedIn: hasCheckedIn
        });
      } else {
        wx.showToast({
          title: res.data.message || '获取打卡状态失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('获取今日打卡状态失败:', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ 'loading.checkin': false });
    }
  },

  // 获取学习数据
  async getStudyStats() {
    try {
      this.setData({ 'loading.stats': true });
      const token = wx.getStorageSync('token');
      
      // 获取用户基本统计数据
      const statsRes = await wx.request({
        url: `${app.globalData.apiBaseUrl}/users/stats`,
        header: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 获取错题数量
      const errorRes = await wx.request({
        url: `${app.globalData.apiBaseUrl}/error-book/count`,
        header: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 获取模考平均分
      const examRes = await wx.request({
        url: `${app.globalData.apiBaseUrl}/data-analysis/personal`,
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          timeRange: '30'
        }
      });
      
      if (statsRes.data.code === 0) {
        this.setData({
          totalCheckins: statsRes.data.data.checkinDays,
          totalStudyHours: statsRes.data.data.studyHours,
          totalErrorQuestions: errorRes.data.code === 0 ? errorRes.data.data : 0,
          examAverageScore: examRes.data.code === 0 ? examRes.data.data.summary.examAverageScore : 0
        });
      } else {
        wx.showToast({
          title: statsRes.data.message || '获取学习数据失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('获取学习数据失败:', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ 'loading.stats': false });
    }
  },

  // 获取推荐搭子
  async getRecommendPartners() {
    try {
      this.setData({ 'loading.partners': true });
      const token = wx.getStorageSync('token');
      const res = await wx.request({
        url: `${app.globalData.apiBaseUrl}/partners/recommend`,
        header: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.data.code === 0) {
        // 只显示前3个推荐搭子
        this.setData({
          recommendPartners: res.data.data.slice(0, 3)
        });
      } else {
        wx.showToast({
          title: res.data.message || '获取推荐搭子失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('获取推荐搭子失败:', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ 'loading.partners': false });
    }
  },

  // 获取近期打卡记录
  async getRecentCheckins() {
    try {
      this.setData({ 'loading.recentCheckins': true });
      const token = wx.getStorageSync('token');
      const res = await wx.request({
        url: `${app.globalData.apiBaseUrl}/checkins/my`,
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          page: 1,
          limit: 3
        },
        method: 'GET'
      });
      
      if (res.data.code === 0) {
        this.setData({
          recentCheckins: res.data.data.list
        });
      } else {
        wx.showToast({
          title: res.data.message || '获取打卡记录失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('获取近期打卡记录失败:', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ 'loading.recentCheckins': false });
    }
  },

  // 前往登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 前往打卡页面
  goToCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/checkin'
    });
  },

  // 前往匹配页面
  goToMatch() {
    wx.navigateTo({
      url: '/pages/match/match'
    });
  },

  // 前往搭子详情页面
  goToPartnerDetail(e) {
    const partnerId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/profile/partners?id=${partnerId}`
    });
  },

  // 前往打卡历史页面
  goToCheckinHistory() {
    wx.navigateTo({
      url: '/pages/checkin/checkin'
    });
  },

  // 获取今日考点
  async getTodayPoint() {
    try {
      this.setData({ 'loading.dailyPoint': true });
      const token = wx.getStorageSync('token');
      const res = await wx.request({
        url: `${app.globalData.apiBaseUrl}/daily-point/today`,
        header: {
          'Authorization': `Bearer ${token}`
        },
        method: 'GET'
      });
      
      if (res.data.code === 0) {
        this.setData({
          todayPoint: res.data.data
        });
      } else {
        console.error('获取今日考点失败:', res.data.message);
      }
    } catch (error) {
      console.error('获取今日考点失败:', error);
    } finally {
      this.setData({ 'loading.dailyPoint': false });
    }
  },

  // 前往每日考点详情页面
  goToDailyPoint() {
    wx.navigateTo({
      url: '/pages/dailyPoint/dailyPoint'
    });
  },

  // 前往共享错题本页面
  goToErrorBook() {
    wx.navigateTo({
      url: '/pages/errorBook/errorBook'
    });
  },

  // 前往模考组队页面
  goToExamTeam() {
    wx.navigateTo({
      url: '/pages/examTeam/examTeam'
    });
  },

  // 前往数据复盘页面
  goToDataAnalysis() {
    wx.navigateTo({
      url: '/pages/dataAnalysis/dataAnalysis'
    });
  }
});
