// DissolveConfirm.js
Component({
  properties: {
    partnerId: {
      type: String,
      value: ''
    },
    partnerName: {
      type: String,
      value: ''
    }
  },

  data: {
    visible: false,
    reason: '',
    submitting: false
  },

  methods: {
    // 显示确认框
    show() {
      this.setData({
        visible: true,
        reason: ''
      });
    },

    // 隐藏确认框
    hide() {
      this.setData({
        visible: false
      });
    },

    // 输入解除原因
    onReasonChange(e) {
      this.setData({
        reason: e.detail.value
      });
    },

    // 确认解除
    confirmDissolve() {
      this.setData({ submitting: true });
      const app = getApp();
      const token = wx.getStorageSync('token');
      
      wx.request({
      url: `${app.globalData.apiBaseUrl}/partners/${this.properties.partnerId}`,
      method: 'DELETE',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '关系已解除',
            icon: 'success',
            duration: 2000
          });
          // 触发解除成功事件
          this.triggerEvent('dissolvesuccess', { partnerId: this.properties.partnerId });
          this.hide();
        } else {
          wx.showToast({
            title: res.data.message || '解除失败',
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
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
    }
  }
});