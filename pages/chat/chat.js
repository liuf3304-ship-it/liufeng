// chat.js
const app = getApp();
Page({
  data: {
    partnerId: '',
    partnerInfo: {},
    messages: [],
    inputContent: '',
    scrollTop: 0,
    isLoading: true,
    hasMore: true,
    page: 1,
    limit: 20
  },

  onLoad(options) {
    if (options.partnerId) {
      this.setData({
        partnerId: options.partnerId
      });
      this.getPartnerInfo();
      this.getChatHistory();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  // 获取搭子信息
  getPartnerInfo() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/profile?id=${this.data.partnerId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            partnerInfo: res.data.data
          });
          // 设置页面标题
          wx.setNavigationBarTitle({
            title: `${res.data.data.nickname || '搭子'}的聊天`
          });
        }
      },
      fail: (err) => {
        console.error('获取搭子信息失败:', err);
      }
    });
  },

  // 获取聊天记录
  getChatHistory() {
    const token = wx.getStorageSync('token');
    const { partnerId, page, limit } = this.data;

    wx.request({
      url: `${app.globalData.apiBaseUrl}/chat/history/${partnerId}?page=${page}&limit=${limit}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          const messages = res.data.data;
          this.setData({
            messages: page === 1 ? messages : [...this.data.messages, ...messages],
            isLoading: false,
            hasMore: messages.length === limit
          });
          // 滚动到底部
          this.scrollToBottom();
        } else {
          wx.showToast({
            title: res.data.msg || '获取聊天记录失败',
            icon: 'none'
          });
          this.setData({
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取聊天记录失败:', err);
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

  // 发送消息
  sendMessage() {
    const { inputContent, partnerId } = this.data;
    if (!inputContent.trim()) {
      return;
    }

    const token = wx.getStorageSync('token');
    const message = {
      content: inputContent,
      type: 'text',
      status: 0,
      createdAt: new Date(),
      Sender: {
        id: app.globalData.userInfo.id,
        nickname: app.globalData.userInfo.nickname,
        avatar: app.globalData.userInfo.avatar
      }
    };

    // 先添加到本地消息列表，提高用户体验
    this.setData({
      messages: [message, ...this.data.messages],
      inputContent: ''
    });
    this.scrollToBottom();

    // 发送消息到服务器
    wx.request({
      url: `${app.globalData.apiBaseUrl}/chat/send/${partnerId}`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        content: inputContent,
        type: 'text'
      },
      success: (res) => {
        if (res.data.code !== 0) {
          wx.showToast({
            title: res.data.msg || '发送消息失败',
            icon: 'none'
          });
          // 如果发送失败，从本地消息列表中移除
          this.setData({
            messages: this.data.messages.filter(msg => msg !== message)
          });
        }
      },
      fail: (err) => {
        console.error('发送消息失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        // 如果发送失败，从本地消息列表中移除
        this.setData({
          messages: this.data.messages.filter(msg => msg !== message)
        });
      }
    });
  },

  // 监听输入框变化
  onInputChange(e) {
    this.setData({
      inputContent: e.detail.value
    });
  },

  // 滚动到底部
  scrollToBottom() {
    setTimeout(() => {
      this.setData({
        scrollTop: 0
      });
    }, 100);
  },

  // 加载更多聊天记录
  loadMore() {
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }

    this.setData({
      isLoading: true,
      page: this.data.page + 1
    });
    this.getChatHistory();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});