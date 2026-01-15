// feedback.js
Page({
  data: {
    feedbackType: 'bug', // 默认反馈类型为Bug报告
    feedbackContent: '', // 反馈内容
    images: [], // 上传的图片列表
    contactInfo: '', // 联系方式
    canSubmit: false, // 是否可以提交
    isSubmitting: false // 是否正在提交
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    // 初始化页面数据
  },

  // 监听页面显示
  onShow() {
    // 页面显示时的处理
  },

  // 选择反馈类型
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      feedbackType: type
    });
    this.checkSubmitStatus();
  },

  // 输入反馈内容
  onContentInput(e) {
    const content = e.detail.value;
    this.setData({
      feedbackContent: content
    });
    this.checkSubmitStatus();
  },

  // 选择图片
  chooseImage() {
    const that = this;
    const currentCount = that.data.images.length;
    const maxCount = 3 - currentCount;

    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        const newImages = that.data.images.concat(tempFilePaths);
        
        that.setData({
          images: newImages
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    
    this.setData({
      images: images
    });
  },

  // 输入联系方式
  onContactInput(e) {
    const contact = e.detail.value;
    this.setData({
      contactInfo: contact
    });
  },

  // 检查是否可以提交
  checkSubmitStatus() {
    const { feedbackType, feedbackContent } = this.data;
    const canSubmit = feedbackType && feedbackContent.trim().length > 0;
    
    this.setData({
      canSubmit: canSubmit
    });
  },

  // 提交反馈
  submitFeedback(e) {
    const { feedbackType, feedbackContent, images, contactInfo } = this.data;
    
    // 表单验证
    if (!feedbackContent.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isSubmitting: true
    });
    
    // 模拟上传图片到服务器（实际项目中需要替换为真实的上传接口）
    const uploadImages = () => {
      if (images.length === 0) {
        return Promise.resolve([]);
      }
      
      const uploadPromises = images.map((imagePath, index) => {
        return new Promise((resolve, reject) => {
          // 这里应该调用真实的图片上传接口
          // 模拟上传成功
          setTimeout(() => {
            resolve(`https://example.com/uploads/feedback_${Date.now()}_${index}.jpg`);
          }, 500);
        });
      });
      
      return Promise.all(uploadPromises);
    };
    
    // 上传图片并提交反馈
    uploadImages().then(uploadedUrls => {
      // 调用反馈提交接口
      const app = getApp();
      wx.request({
        url: `${app.globalData.apiBaseUrl}/feedback`,
        method: 'POST',
        data: {
          type: feedbackType,
          content: feedbackContent,
          images: uploadedUrls,
          contact: contactInfo
        },
        success(res) {
          if (res.statusCode === 201) {
            wx.showToast({
              title: '反馈提交成功',
              icon: 'success',
              duration: 2000,
              success() {
                // 跳转到首页或返回上一页
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              }
            });
          } else {
            wx.showToast({
              title: '反馈提交失败',
              icon: 'none'
            });
          }
        },
        fail(err) {
          console.error('提交反馈失败:', err);
          wx.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        },
        complete() {
          this.setData({
            isSubmitting: false
          });
        }
      });
    }).catch(err => {
      console.error('上传图片失败:', err);
      wx.showToast({
        title: '图片上传失败',
        icon: 'none'
      });
      this.setData({
        isSubmitting: false
      });
    });
  }
});