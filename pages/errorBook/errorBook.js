// errorBook.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    errorQuestions: [],
    isLoading: false,
    page: 1,
    limit: 10,
    hasMore: true,
    showAddModal: false,
    newQuestionId: '',
    newErrorReason: '',
    newShareStatus: false,
    selectedModule: 'all',
    showManualInputForm: false
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新数据
    if (this.data.isLoggedIn) {
      this.getPersonalErrorBook();
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

  // 获取个人错题本
  getPersonalErrorBook(refresh = false) {
    if (this.data.isLoading) return;

    const page = refresh ? 1 : this.data.page;
    this.setData({
      isLoading: true
    });

    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/errorbook/personal?page=${page}&limit=${this.data.limit}`,
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
            title: res.data.msg || '获取错题本失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取错题本失败:', err);
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

  // 刷新错题本
  refreshErrorBook() {
    this.getPersonalErrorBook(true);
  },

  // 加载更多错题
  loadMoreQuestions() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({
        page: this.data.page + 1
      });
      this.getPersonalErrorBook();
    }
  },

  // 显示添加错题模态框
  showAddModal() {
    this.setData({
      showAddModal: true
    });
  },

  // 隐藏添加模态框
  hideAddModal() {
    this.setData({
      showAddModal: false,
      newQuestionId: '',
      newErrorReason: '',
      newShareStatus: false,
      showManualInputForm: false
    });
  },

  // 薄弱模块筛选
  onModuleFilter(e) {
    const module = e.currentTarget.dataset.module;
    this.setData({
      selectedModule: module,
      errorQuestions: [],
      page: 1,
      hasMore: true
    });
    this.getErrorQuestions();
  },

  // 显示手动输入表单
  showManualInput() {
    this.setData({
      showManualInputForm: true
    });
  },

  // 显示拍照识别
  showPhotoUpload() {
    // 调用微信拍照API
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        // 这里可以添加拍照识别逻辑
        wx.showToast({
          title: '拍照识别功能开发中',
          icon: 'none'
        });
        this.hideAddModal();
      },
      fail: (err) => {
        console.error('拍照失败:', err);
        wx.showToast({
          title: '拍照失败',
          icon: 'none'
        });
      }
    });
  },

  // 输入题目ID
  onQuestionIdInput(e) {
    this.setData({
      newQuestionId: e.detail.value
    });
  },

  // 输入错误原因
  onErrorReasonInput(e) {
    this.setData({
      newErrorReason: e.detail.value
    });
  },

  // 切换共享状态
  onShareStatusChange(e) {
    this.setData({
      newShareStatus: e.detail.value
    });
  },

  // 上传错题
  uploadErrorQuestion() {
    const { newQuestionId, newErrorReason, newShareStatus } = this.data;
    
    if (!newQuestionId.trim()) {
      wx.showToast({
        title: '请输入题目ID',
        icon: 'none'
      });
      return;
    }

    const token = wx.getStorageSync('token');

    wx.showLoading({
      title: '上传中...',
      mask: true
    });

    wx.request({
      url: `${app.globalData.apiBaseUrl}/errorbook`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        questionId: newQuestionId.trim(),
        errorReason: newErrorReason.trim(),
        shareStatus: newShareStatus
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
          this.hideAddModal();
          this.refreshErrorBook();
        } else {
          wx.showToast({
            title: res.data.msg || '上传失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('上传错题失败:', err);
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

  // 一键导出错题PDF
  exportPDF() {
    wx.showToast({
      title: '导出功能开发中',
      icon: 'none'
    });
  },

  // 跳转到共享错题广场
  goToErrorSquare() {
    wx.navigateTo({
      url: '/pages/errorSquare/errorSquare'
    });
  }
});