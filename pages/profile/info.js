// profile/info.js
const app = getApp();
Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    examTypes: ['考研', '考公', '四六级', '教资', '其他'],
    examTypeIndex: 0,
    studyHours: 6,
    examDate: '',
    startDate: '',
    endDate: '',
    targetScore: 0,
    isSubmitting: false
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
    // 初始化日期范围
    this.initDateRange();
  },

  onShow() {
    // 每次显示页面时获取最新用户信息
    if (this.data.isLoggedIn) {
      this.getUserInfo();
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

  // 初始化日期范围
  initDateRange() {
    const now = new Date();
    const startDate = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');
    const endDate = (now.getFullYear() + 2) + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');
    this.setData({
      startDate: startDate,
      endDate: endDate
    });
  },

  // 获取用户信息
  getUserInfo() {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/profile`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          const userInfo = res.data.data;
          // 设置考试类型索引
          const examTypeIndex = this.data.examTypes.indexOf(userInfo.examType) || 0;
          // 设置学习时长
          const studyHours = userInfo.studyHours || 6;
          // 设置目标分数
          const targetScore = userInfo.targetScore || 0;
          
          this.setData({
            userInfo: userInfo,
            examTypeIndex: examTypeIndex,
            studyHours: studyHours,
            examDate: userInfo.examDate || '',
            targetScore: targetScore
          });
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
      }
    });
  },

  // 智能填充考试日期（根据考试类型自动推荐）
  autoFillExamDate() {
    const examType = this.data.userInfo.examType;
    if (!examType) return;
    
    const now = new Date();
    let recommendedDate = new Date();
    
    // 根据不同考试类型推荐不同的考试日期
    switch (examType) {
      case '考研':
        // 考研通常在每年12月下旬
        recommendedDate.setMonth(11); // 12月
        recommendedDate.setDate(25);
        // 如果当前月份已经过了12月，推荐下一年
        if (now.getMonth() > 11 || (now.getMonth() === 11 && now.getDate() > 25)) {
          recommendedDate.setFullYear(recommendedDate.getFullYear() + 1);
        }
        break;
      case '考公':
        // 国考通常在每年11月底或12月初
        recommendedDate.setMonth(10); // 11月
        recommendedDate.setDate(25);
        // 如果当前月份已经过了11月，推荐下一年
        if (now.getMonth() > 10 || (now.getMonth() === 10 && now.getDate() > 25)) {
          recommendedDate.setFullYear(recommendedDate.getFullYear() + 1);
        }
        break;
      case '四六级':
        // 四六级每年6月和12月
        if (now.getMonth() < 6) {
          // 上半年推荐6月中旬
          recommendedDate.setMonth(5); // 6月
          recommendedDate.setDate(15);
        } else {
          // 下半年推荐12月中旬
          recommendedDate.setMonth(11); // 12月
          recommendedDate.setDate(15);
        }
        break;
      case '教资':
        // 教资每年3月和11月
        if (now.getMonth() < 3) {
          // 上半年推荐3月中旬
          recommendedDate.setMonth(2); // 3月
          recommendedDate.setDate(15);
        } else if (now.getMonth() < 11) {
          // 下半年推荐11月中旬
          recommendedDate.setMonth(10); // 11月
          recommendedDate.setDate(15);
        } else {
          // 下一年3月
          recommendedDate.setFullYear(recommendedDate.getFullYear() + 1);
          recommendedDate.setMonth(2); // 3月
          recommendedDate.setDate(15);
        }
        break;
      default:
        // 其他考试默认推荐3个月后
        recommendedDate.setMonth(recommendedDate.getMonth() + 3);
        recommendedDate.setDate(15);
        break;
    }
    
    // 格式化日期为YYYY-MM-DD
    const formattedDate = recommendedDate.toISOString().split('T')[0];
    
    this.setData({
      examDate: formattedDate,
      'userInfo.examDate': formattedDate
    });
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 上传头像
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  // 上传头像
  uploadAvatar(filePath) {
    const token = wx.getStorageSync('token');

    wx.uploadFile({
      url: `${app.globalData.apiBaseUrl}/users/avatar`,
      filePath: filePath,
      name: 'avatar',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          wx.showToast({
            title: '头像上传成功',
            icon: 'success'
          });
          // 更新用户信息
          this.getUserInfo();
        } else {
          wx.showToast({
            title: data.msg || '头像上传失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('头像上传失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 昵称输入变化
  onNicknameChange(e) {
    this.setData({
      'userInfo.nickname': e.detail.value
    });
  },

  // 考试类型选择变化
  onExamTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      examTypeIndex: index,
      'userInfo.examType': this.data.examTypes[index]
    });
    
    // 智能填充考试日期
    this.autoFillExamDate();
  },

  // 考试日期选择变化
  onExamDateChange(e) {
    this.setData({
      examDate: e.detail.value,
      'userInfo.examDate': e.detail.value
    });
  },

  // 学习时长滑块变化
  onStudyHoursChange(e) {
    this.setData({
      studyHours: e.detail.value
    });
  },

  // 自我介绍输入变化
  onSelfIntroductionChange(e) {
    this.setData({
      'userInfo.selfIntroduction': e.detail.value
    });
  },

  // 绑定手机号
  bindPhone() {
    wx.showToast({
      title: '手机号绑定功能开发中',
      icon: 'none'
    });
  },

  // 提交用户信息
  submitUserInfo(e) {
    const { userInfo, studyHours } = this.data;

    // 简化表单验证，只验证关键字段
    if (!userInfo.nickname || userInfo.nickname.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isSubmitting: true
    });

    const token = wx.getStorageSync('token');

    // 优化提交数据，只提交有变化的字段
    const updateData = {
      nickname: userInfo.nickname.trim(),
      studyHours: studyHours
    };

    // 只有当字段有值时才提交
    if (userInfo.examType) {
      updateData.examType = userInfo.examType;
    }

    if (userInfo.examDate) {
      updateData.examDate = userInfo.examDate;
    }

    if (userInfo.selfIntroduction) {
      updateData.selfIntroduction = userInfo.selfIntroduction;
    }

    if (this.data.targetScore > 0) {
      updateData.targetScore = this.data.targetScore;
    }

    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/profile`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: updateData,
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '信息保存成功',
            icon: 'success',
            duration: 1500
          });
          // 更新全局用户信息
          app.globalData.userInfo = res.data.data;
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '信息保存失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('保存用户信息失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({
          isSubmitting: false
        });
      }
    });
  }
});