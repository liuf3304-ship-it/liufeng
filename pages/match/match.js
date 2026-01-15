// match.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    examTypes: ['考研', '考公', '四六级', '教资', '其他'],
    examTypeIndex: 0,
    stages: ['基础阶段', '强化阶段', '冲刺阶段', '备考中'],
    stageIndex: 0,
    studyHours: 6,
    matchCount: 1,
    isMatching: false,
    matches: [],
    showSkeleton: false,
    requestTimer: null,
    cacheExpireTime: 0
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
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

  // 考试类型选择变化
  onExamTypeChange(e) {
    this.setData({
      examTypeIndex: e.detail.value
    });
  },

  // 备考阶段选择变化
  onStageChange(e) {
    this.setData({
      stageIndex: e.detail.value
    });
  },

  // 学习时长滑块变化
  onStudyHoursChange(e) {
    this.setData({
      studyHours: e.detail.value
    });
  },

  // 匹配数量选择变化
  onMatchCountChange(e) {
    this.setData({
      matchCount: parseInt(e.detail.value)
    });
  },

  // 开始匹配 - 防抖处理
  startMatching(e) {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 防抖处理，避免用户重复点击
    if (this.data.isMatching) {
      return;
    }

    this.setData({
      isMatching: true,
      showSkeleton: true
    });

    const token = wx.getStorageSync('token');
    const { examTypes, examTypeIndex, studyHours, matchCount } = this.data;
    const cacheKey = `match_${examTypeIndex}_${studyHours}_${matchCount}`;
    const now = Date.now();

    // 检查缓存是否有效（10分钟）
    const cachedData = wx.getStorageSync(cacheKey);
    if (cachedData && now < this.data.cacheExpireTime) {
      this.setData({
        matches: cachedData,
        isMatching: false,
        showSkeleton: false
      });
      wx.showToast({
        title: `从缓存匹配到${cachedData.length}位搭子`,
        icon: 'success'
      });
      return;
    }

    // 清除之前的定时器
    if (this.data.requestTimer) {
      clearTimeout(this.data.requestTimer);
    }

    // 设置新的定时器，模拟网络延迟，避免频繁请求
    this.setData({
      requestTimer: setTimeout(() => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/partners/recommend`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.data.code === 0) {
              // 缓存匹配结果，有效期10分钟
              wx.setStorageSync(cacheKey, res.data.data);
              this.setData({
                matches: res.data.data,
                isMatching: false,
                showSkeleton: false,
                cacheExpireTime: now + 10 * 60 * 1000
              });
              wx.showToast({
                title: `匹配到${res.data.data.length}位搭子`,
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: res.data.msg || '匹配失败',
                icon: 'none'
              });
              this.setData({
                isMatching: false,
                showSkeleton: false
              });
            }
          },
          fail: (err) => {
            console.error('匹配失败:', err);
            wx.showToast({
              title: '网络错误，请稍后重试',
              icon: 'none'
            });
            this.setData({
              isMatching: false,
              showSkeleton: false
            });
          }
        });
      }, 300)
    });
  },

  // 发送搭子请求
  sendRequest(e) {
    const partnerId = e.currentTarget.dataset.id;
    const token = wx.getStorageSync('token');

    // 显示加载状态
    wx.showLoading({
      title: '发送请求中...',
      mask: true
    });

    wx.request({
      url: `${app.globalData.apiBaseUrl}/partners/apply`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        partnerId: partnerId
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '请求已发送',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.msg || '发送失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('发送请求失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        // 隐藏加载状态
        wx.hideLoading();
      }
    });
  }
});