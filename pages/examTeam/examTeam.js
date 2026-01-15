// examTeam.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    examTeams: [],
    page: 1,
    limit: 20,
    hasMore: true,
    isLoading: false,
    showCreateModal: false,
    newTeamName: '',
    newExamId: '',
    newMemberLimit: 5,
    newStartTime: '',
    selectedFilter: 'time', // time 或 members
    weakModules: ['电磁感应', '天体运动', '牛顿运动定律', '机械能守恒', '电场与磁场', '热力学定律', '光学', '近代物理']
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新数据
    if (this.data.isLoggedIn) {
      this.getExamTeams();
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

  // 获取队伍列表
  getExamTeams(refresh = false) {
    if (this.data.isLoading) return;

    const page = refresh ? 1 : this.data.page;
    this.setData({
      isLoading: true
    });

    const token = wx.getStorageSync('token');
    const filter = this.data.selectedFilter;

    wx.request({
      url: `${app.globalData.apiBaseUrl}/exam-team`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        page,
        limit: this.data.limit,
        status: 'recruiting'
      },
      success: (res) => {
        if (res.data.code === 0) {
          const newTeams = res.data.data.list;
          const teams = refresh ? newTeams : [...this.data.examTeams, ...newTeams];
          
          this.setData({
            examTeams: teams,
            page: page,
            hasMore: teams.length < res.data.data.total,
            isLoading: false
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取队伍列表失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取队伍列表失败:', err);
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

  // 刷新队伍列表
  refreshTeams() {
    this.getExamTeams(true);
  },

  // 加载更多队伍
  loadMoreTeams() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({
        page: this.data.page + 1
      });
      this.getExamTeams();
    }
  },

  // 显示创建队伍模态框
  showCreateModal() {
    this.setData({
      showCreateModal: true
    });
  },

  // 隐藏创建队伍模态框
  hideCreateModal() {
    this.setData({
      showCreateModal: false,
      newTeamName: '',
      newExamId: '',
      newMemberLimit: 5,
      newStartTime: ''
    });
  },

  // 输入队伍名称
  onTeamNameInput(e) {
    this.setData({
      newTeamName: e.detail.value
    });
  },

  // 输入模考ID
  onExamIdInput(e) {
    this.setData({
      newExamId: e.detail.value
    });
  },

  // 输入成员上限
  onMemberLimitInput(e) {
    const limit = parseInt(e.detail.value);
    if (!isNaN(limit) && limit >= 2 && limit <= 20) {
      this.setData({
        newMemberLimit: limit
      });
    }
  },

  // 选择开始时间
  onStartTimeChange(e) {
    this.setData({
      newStartTime: e.detail.value
    });
  },

  // 创建队伍
  createTeam() {
    const { newTeamName, newExamId, newMemberLimit, newStartTime } = this.data;
    
    if (!newTeamName.trim()) {
      wx.showToast({
        title: '请输入队伍名称',
        icon: 'none'
      });
      return;
    }
    
    if (!newExamId.trim()) {
      wx.showToast({
        title: '请输入模考ID',
        icon: 'none'
      });
      return;
    }
    
    if (!newStartTime) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      });
      return;
    }
    
    const token = wx.getStorageSync('token');
    
    wx.showLoading({
      title: '创建中...',
      mask: true
    });
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/exam-team`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        teamName: newTeamName,
        examId: newExamId,
        memberLimit: newMemberLimit,
        startTime: newStartTime
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '创建队伍成功',
            icon: 'success'
          });
          this.hideCreateModal();
          this.getExamTeams(true);
        } else {
          wx.showToast({
            title: res.data.msg || '创建队伍失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('创建队伍失败:', err);
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

  // 切换筛选条件
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      selectedFilter: filter,
      page: 1,
      examTeams: []
    });
    this.getExamTeams();
  },

  // 加入队伍
  joinTeam(e) {
    const teamId = e.currentTarget.dataset.teamid;
    
    const token = wx.getStorageSync('token');
    
    wx.showLoading({
      title: '加入中...',
      mask: true
    });
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/exam-team/join`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        teamId
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '加入队伍成功',
            icon: 'success'
          });
          this.getExamTeams(true);
        } else {
          wx.showToast({
            title: res.data.msg || '加入队伍失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加入队伍失败:', err);
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

  // 跳转到队伍详情页面
  goToTeamDetail(e) {
    const teamId = e.currentTarget.dataset.teamid;
    wx.navigateTo({
      url: `/pages/examDetail/examDetail?teamId=${teamId}`
    });
  }
});