// app.js
App({
  onLaunch() {
    // 全局登录状态检查
    this.checkLoginStatus();
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      // 验证token有效性
      this.verifyToken(token);
    } else {
      this.globalData.isLoggedIn = false;
    }
  },
  
  // 验证token
  verifyToken(token) {
    wx.request({
      url: `${this.globalData.apiBaseUrl}/users/profile`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.globalData.isLoggedIn = true;
          this.globalData.userInfo = res.data.data;
        } else {
          this.globalData.isLoggedIn = false;
          wx.removeStorageSync('token');
        }
      },
      fail: () => {
        this.globalData.isLoggedIn = false;
        wx.removeStorageSync('token');
      }
    });
  },
  
  // 全局数据
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    apiBaseUrl: wx.getAccountInfoSync().miniProgram.appId ? 'https://liufeng-dazi-v1.vercel.app/api' : 'http://localhost:3000/api',
    wechatAppid: 'wxeba310e6d2fa09ca'
  }
})
