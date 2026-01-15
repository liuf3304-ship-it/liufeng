// profile/deposit.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    balance: 0,
    depositStatus: 'inactive', // active, inactive, refunding
    depositHistory: []
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时获取最新押金信息
    if (this.data.isLoggedIn) {
      this.getDepositInfo();
      this.getDepositHistory();
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

  // 获取押金信息
  getDepositInfo() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/deposit/info`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            balance: res.data.data.balance,
            depositStatus: res.data.data.status
          });
        }
      },
      fail: (err) => {
        console.error('获取押金信息失败:', err);
      }
    });
  },

  // 获取押金历史记录
  getDepositHistory() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/deposit/history`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        page: 1,
        limit: 10
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            depositHistory: res.data.data.list
          });
        }
      },
      fail: (err) => {
        console.error('获取押金历史记录失败:', err);
      }
    });
  },

  // 缴纳押金
  payDeposit() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/deposit/pay`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        amount: 99
      },
      success: (res) => {
        if (res.data.code === 0) {
          // 调用微信支付
          this.wxPay(res.data.data);
        } else {
          wx.showToast({
            title: res.data.msg || '支付请求失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('缴纳押金请求失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 微信支付
  wxPay(payData) {
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package,
      signType: payData.signType,
      paySign: payData.paySign,
      success: (res) => {
        if (res.errMsg === 'requestPayment:ok') {
          wx.showToast({
            title: '押金缴纳成功',
            icon: 'success',
            duration: 2000
          });
          // 更新押金信息
          this.getDepositInfo();
          this.getDepositHistory();
        }
      },
      fail: (err) => {
        console.error('微信支付失败:', err);
        if (err.errMsg !== 'requestPayment:fail cancel') {
          wx.showToast({
            title: '支付失败，请稍后重试',
            icon: 'none'
          });
        }
      }
    });
  },

  // 申请退款
  applyRefund() {
    wx.showModal({
      title: '申请退款',
      content: '确定要申请押金退款吗？退款将在3-5个工作日内到账。',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token');

          wx.request({
            url: `${app.globalData.apiBaseUrl}/deposit/refund`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({
                  title: '退款申请成功',
                  icon: 'success',
                  duration: 2000
                });
                // 更新押金信息
                this.getDepositInfo();
                this.getDepositHistory();
              } else {
                wx.showToast({
                  title: res.data.msg || '退款申请失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('申请退款失败:', err);
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
});