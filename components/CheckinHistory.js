// CheckinHistory.js
Component({
  properties: {
    userId: {
      type: String,
      value: ''
    },
    limit: {
      type: Number,
      value: 5
    }
  },

  data: {
    checkins: [],
    loading: false
  },

  lifetimes: {
    attached() {
      // 组件挂载时获取打卡历史
      if (this.properties.userId) {
        this.getCheckinHistory();
      }
    }
  },

  methods: {
    // 获取打卡历史
    getCheckinHistory() {
      this.setData({ loading: true });
      const app = getApp();
      const token = wx.getStorageSync('token');
      
      wx.request({
        url: `${app.globalData.apiBaseUrl}/checkins/user/${this.properties.userId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          page: 1,
          limit: this.properties.limit
        },
        success: (res) => {
          if (res.data.code === 0) {
            this.setData({
              checkins: res.data.data.list || []
            });
          }
        },
        fail: (err) => {
          console.error('获取打卡历史失败:', err);
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    }
  }
});