// examDetail.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    teamDetail: null,
    members: [],
    isMember: false,
    isCreator: false,
    isLoading: false,
    showInviteModal: false
  },

  onLoad(options) {
    // 检查登录状态
    this.checkLoginStatus();
    // 获取队伍ID
    this.setData({
      teamId: options.teamId
    });
    // 获取队伍详情
    this.getTeamDetail();
  },

  onShow() {
    // 每次显示页面时获取最新数据
    if (this.data.isLoggedIn) {
      this.getTeamDetail();
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

  // 获取队伍详情
  getTeamDetail() {
    this.setData({
      isLoading: true
    });

    const token = wx.getStorageSync('token');
    const teamId = this.data.teamId;

    wx.request({
      url: `${app.globalData.apiBaseUrl}/exam-team/${teamId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          const { team, members, isMember } = res.data.data;
          // 检查是否是创建者
          const isCreator = members.some(member => member.userId === app.globalData.userInfo.id && member.role === 'creator');
          
          this.setData({
            teamDetail: team,
            members: members,
            isMember: isMember,
            isCreator: isCreator,
            isLoading: false
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取队伍详情失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取队伍详情失败:', err);
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

  // 显示邀请搭子模态框
  showInviteModal() {
    this.setData({
      showInviteModal: true
    });
  },

  // 隐藏邀请搭子模态框
  hideInviteModal() {
    this.setData({
      showInviteModal: false
    });
  },

  // 邀请搭子
  invitePartner() {
    const teamId = this.data.teamId;
    // 调用微信分享API
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    this.hideInviteModal();
    wx.showToast({
      title: '邀请功能已启动',
      icon: 'success'
    });
  },

  // 退出队伍
  quitTeam() {
    const token = wx.getStorageSync('token');
    const teamId = this.data.teamId;
    
    wx.showModal({
      title: '确认退出',
      content: '确定要退出这个模考队伍吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.apiBaseUrl}/exam-team/${teamId}/quit`,
            method: 'DELETE',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({
                  title: '退出队伍成功',
                  icon: 'success'
                });
                // 返回上一页
                wx.navigateBack();
              } else {
                wx.showToast({
                  title: res.data.msg || '退出队伍失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('退出队伍失败:', err);
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

  // 启动模考
  startExam() {
    const token = wx.getStorageSync('token');
    const teamId = this.data.teamId;
    
    wx.showModal({
      title: '确认启动',
      content: '确定要启动这个模考吗？启动后所有成员将开始考试。',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.apiBaseUrl}/exam-team/${teamId}/start`,
            method: 'PUT',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({
                  title: '启动模考成功',
                  icon: 'success'
                });
                // 刷新队伍详情
                this.getTeamDetail();
              } else {
                wx.showToast({
                  title: res.data.msg || '启动模考失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('启动模考失败:', err);
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

  // 加入队伍
  joinTeam() {
    const token = wx.getStorageSync('token');
    const teamId = this.data.teamId;
    
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
          // 刷新队伍详情
          this.getTeamDetail();
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
  }
});