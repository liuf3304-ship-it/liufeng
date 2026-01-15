// login.js
const app = getApp();
Page({
  data: {
    phone: '',
    verificationCode: '',
    countdown: 0,
    showPhoneLogin: false,
    agreeTerms: false,
    loginSuccess: false
  },

  onLoad() {
    // 检查是否已登录
    if (app.globalData.isLoggedIn) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 手机号输入变化
  onPhoneChange(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 验证码输入变化
  onVerificationCodeChange(e) {
    this.setData({
      verificationCode: e.detail.value
    });
  },

  // 切换登录方式
  toggleLoginType() {
    this.setData({
      showPhoneLogin: !this.data.showPhoneLogin
    });
  },

  // 协议勾选变化
  onAgreementChange(e) {
    this.setData({
      agreeTerms: e.detail.value
    });
  },

  // 显示用户协议
  showTerms() {
    wx.showModal({
      title: '用户协议',
      content: '用户协议内容...',
      showCancel: false
    });
  },

  // 显示隐私政策
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '隐私政策内容...',
      showCancel: false
    });
  },

  // 获取验证码
  getVerificationCode() {
    const { phone } = this.data;

    // 手机号验证
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none'
      });
      return;
    }

    // 发送验证码请求
    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/send-code`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        phone: phone
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '验证码发送成功',
            icon: 'success'
          });
          // 开始倒计时
          this.startCountdown();
        } else {
          wx.showToast({
            title: res.data.msg || '验证码发送失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('发送验证码失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 倒计时
  startCountdown() {
    this.setData({ countdown: 60 });
    const timer = setInterval(() => {
      this.setData({ countdown: this.data.countdown - 1 });
      if (this.data.countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  },

  // 手机号登录
  login() {
    const { phone, verificationCode, agreeTerms } = this.data;

    // 表单验证
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none'
      });
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      wx.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      });
      return;
    }

    if (!agreeTerms) {
      wx.showToast({
        title: '请阅读并同意用户协议',
        icon: 'none'
      });
      return;
    }

    // 发送登录请求
    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/login/phone`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        phone: phone,
        code: verificationCode
      },
      success: (res) => {
        if (res.data.code === 0) {
          // 登录成功
          this.handleLoginSuccess(res.data.data);
        } else {
          wx.showToast({
            title: res.data.msg || '登录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('登录失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 微信登录
  wechatLogin() {
    const { agreeTerms } = this.data;

    if (!agreeTerms) {
      wx.showToast({
        title: '请阅读并同意用户协议',
        icon: 'none'
      });
      return;
    }

    // 微信登录授权
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 获取用户信息
          wx.getUserProfile({
            desc: '用于完善会员资料',
            success: (userProfileRes) => {
              // 发送微信登录请求
              wx.request({
                url: `${app.globalData.apiBaseUrl}/users/login/wechat`,
                method: 'POST',
                header: {
                  'Content-Type': 'application/json'
                },
                data: {
                  code: loginRes.code,
                  userInfo: userProfileRes.userInfo
                },
                success: (res) => {
                  if (res.data.code === 0) {
                    // 登录成功
                    this.handleLoginSuccess(res.data.data);
                  } else {
                    wx.showToast({
                      title: res.data.msg || '微信登录失败',
                      icon: 'none'
                    });
                  }
                },
                fail: (err) => {
                  console.error('微信登录失败:', err);
                  wx.showToast({
                    title: '网络错误，请稍后重试',
                    icon: 'none'
                  });
                }
              });
            },
            fail: (err) => {
              console.error('获取用户信息失败:', err);
              wx.showToast({
                title: '请授权用户信息',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '微信登录失败，请稍后重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('微信登录失败:', err);
        wx.showToast({
          title: '微信登录失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 处理登录成功
  handleLoginSuccess(data) {
    // 保存token到本地存储
    wx.setStorageSync('token', data.token);
    // 更新全局登录状态
    app.globalData.isLoggedIn = true;
    app.globalData.userInfo = data.user; // 注意：后端返回的是user，不是userInfo
    // 显示登录成功提示
    this.setData({
      loginSuccess: true
    });
    // 跳转到首页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1000);
  }
});