// errorSquare.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    errorQuestions: [],
    page: 1,
    limit: 20,
    hasMore: true,
    isLoading: false,
    selectedModule: '',
    weakModules: ['电磁感应', '天体运动', '牛顿运动定律', '机械能守恒', '电场与磁场', '热力学定律', '光学', '近代物理']
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新数据
    if (this.data.isLoggedIn) {
      this.getErrorSquare();
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

  // 获取共享错题广场
  getErrorSquare(refresh = false) {
    if (this.data.isLoading) return;

    const page = refresh ? 1 : this.data.page;
    this.setData({
      isLoading: true
    });

    const token = wx.getStorageSync('token');
    const weakModule = this.data.selectedModule || '';

    wx.request({
      url: `${app.globalData.apiBaseUrl}/errorbook/square?page=${page}&limit=${this.data.limit}&weakModule=${weakModule}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          const newQuestions = res.data.data.list;
          const questions = refresh ? newQuestions : [...this.data.errorQuestions, ...newQuestions];
          
          this.setData({
            errorQuestions: questions,
            page: page,
            hasMore: questions.length < res.data.data.total,
            isLoading: false
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取错题广场失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取错题广场失败:', err);
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

  // 刷新错题广场
  refreshErrorSquare() {
    this.getErrorSquare(true);
  },

  // 加载更多错题
  loadMoreQuestions() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({
        page: this.data.page + 1
      });
      this.getErrorSquare();
    }
  },

  // 切换薄弱模块筛选
  onModuleChange(e) {
    const module = e.currentTarget.dataset.module;
    this.setData({
      selectedModule: module === this.data.selectedModule ? '' : module,
      page: 1,
      errorQuestions: []
    });
    this.getErrorSquare();
  },

  // 收藏错题
  collectQuestion(e) {
    const id = e.currentTarget.dataset.id;
    const isCollected = e.currentTarget.dataset.collected;
    
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/errorbook/${id}/collect`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        isCollected: !isCollected
      },
      success: (res) => {
        if (res.data.code === 0) {
          // 更新本地数据
          const errorQuestions = this.data.errorQuestions.map(q => {
            if (q.id === id) {
              return { ...q, isCollected: !isCollected };
            }
            return q;
          });
          
          this.setData({
            errorQuestions: errorQuestions
          });
          
          wx.showToast({
            title: isCollected ? '取消收藏成功' : '收藏成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.msg || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('收藏错题失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到错题详情
  goToQuestionDetail(e) {
    const id = e.currentTarget.dataset.id;
    // TODO: 实现错题详情页面
    wx.showToast({
      title: '详情功能开发中',
      icon: 'none'
    });
  },

  // 跳转到个人错题本
  goToErrorBook() {
    wx.navigateTo({
      url: '/pages/errorBook/errorBook'
    });
  }
});