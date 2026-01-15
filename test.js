// 测试文件：模拟完整用户操作流程
const app = getApp();

// 测试配置
const testConfig = {
  phone: '13800138000', // 测试手机号
  code: '123456', // 测试验证码
  nickname: '测试用户',
  examType: '考研',
  examDate: '2024-12-23',
  studyHours: 6
};

// 测试结果
let testResults = [];

// 测试函数
async function runTests() {
  console.log('开始测试备考搭子小程序完整流程...');
  
  try {
    // 1. 测试发送验证码
    console.log('1. 测试发送验证码...');
    await testSendCode();
    
    // 2. 测试手机号登录
    console.log('2. 测试手机号登录...');
    await testPhoneLogin();
    
    // 3. 测试获取用户信息
    console.log('3. 测试获取用户信息...');
    await testGetUserInfo();
    
    // 4. 测试更新用户信息
    console.log('4. 测试更新用户信息...');
    await testUpdateUserInfo();
    
    // 5. 测试获取推荐搭子
    console.log('5. 测试获取推荐搭子...');
    await testGetRecommendPartners();
    
    // 6. 测试获取我的搭子
    console.log('6. 测试获取我的搭子...');
    await testGetMyPartners();
    
    // 7. 测试打卡
    console.log('7. 测试打卡...');
    await testCreateCheckin();
    
    // 8. 测试获取打卡记录
    console.log('8. 测试获取打卡记录...');
    await testGetCheckinHistory();
    
    console.log('\n✅ 所有测试完成！');
    console.log('测试结果：', testResults);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.log('测试结果：', testResults);
  }
}

// 1. 测试发送验证码
function testSendCode() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/send-code`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        phone: testConfig.phone
      },
      success: (res) => {
        if (res.data.code === 0) {
          testResults.push({ test: '发送验证码', status: 'success', message: '验证码发送成功' });
          resolve();
        } else {
          testResults.push({ test: '发送验证码', status: 'fail', message: res.data.msg || '发送失败' });
          reject(new Error('发送验证码失败'));
        }
      },
      fail: (err) => {
        testResults.push({ test: '发送验证码', status: 'error', message: err.errMsg });
        reject(err);
      }
    });
  });
}

// 2. 测试手机号登录
function testPhoneLogin() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/login/phone`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        phone: testConfig.phone,
        code: testConfig.code
      },
      success: (res) => {
        if (res.data.code === 0) {
          // 保存token
          wx.setStorageSync('token', res.data.data.token);
          app.globalData.isLoggedIn = true;
          app.globalData.userInfo = res.data.data.userInfo;
          testResults.push({ test: '手机号登录', status: 'success', message: '登录成功' });
          resolve();
        } else {
          testResults.push({ test: '手机号登录', status: 'fail', message: res.data.msg || '登录失败' });
          reject(new Error('手机号登录失败'));
        }
      },
      fail: (err) => {
        testResults.push({ test: '手机号登录', status: 'error', message: err.errMsg });
        reject(err);
      }
    });
  });
}

// 3. 测试获取用户信息
function testGetUserInfo() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    if (!token) {
      testResults.push({ test: '获取用户信息', status: 'skip', message: '未登录' });
      resolve();
      return;
    }
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/profile`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          testResults.push({ test: '获取用户信息', status: 'success', message: '获取成功' });
          resolve();
        } else {
          testResults.push({ test: '获取用户信息', status: 'fail', message: res.data.msg || '获取失败' });
          reject(new Error('获取用户信息失败'));
        }
      },
      fail: (err) => {
        testResults.push({ test: '获取用户信息', status: 'error', message: err.errMsg });
        reject(err);
      }
    });
  });
}

// 4. 测试更新用户信息
function testUpdateUserInfo() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    if (!token) {
      testResults.push({ test: '更新用户信息', status: 'skip', message: '未登录' });
      resolve();
      return;
    }
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/users/profile`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        nickname: testConfig.nickname,
        examType: testConfig.examType,
        examDate: testConfig.examDate,
        studyHours: testConfig.studyHours,
        selfIntroduction: '这是一个测试用户的自我介绍'
      },
      success: (res) => {
        if (res.data.code === 0) {
          testResults.push({ test: '更新用户信息', status: 'success', message: '更新成功' });
          resolve();
        } else {
          testResults.push({ test: '更新用户信息', status: 'fail', message: res.data.msg || '更新失败' });
          reject(new Error('更新用户信息失败'));
        }
      },
      fail: (err) => {
        testResults.push({ test: '更新用户信息', status: 'error', message: err.errMsg });
        reject(err);
      }
    });
  });
}

// 5. 测试获取推荐搭子
function testGetRecommendPartners() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    if (!token) {
      testResults.push({ test: '获取推荐搭子', status: 'skip', message: '未登录' });
      resolve();
      return;
    }
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/partners/recommend`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          testResults.push({ test: '获取推荐搭子', status: 'success', message: `获取到${res.data.data.length}位搭子` });
          resolve();
        } else {
          testResults.push({ test: '获取推荐搭子', status: 'fail', message: res.data.msg || '获取失败' });
          reject(new Error('获取推荐搭子失败'));
        }
      },
      fail: (err) => {
        testResults.push({ test: '获取推荐搭子', status: 'error', message: err.errMsg });
        reject(err);
      }
    });
  });
}

// 6. 测试获取我的搭子
function testGetMyPartners() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    if (!token) {
      testResults.push({ test: '获取我的搭子', status: 'skip', message: '未登录' });
      resolve();
      return;
    }
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/partners/my`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          testResults.push({ test: '获取我的搭子', status: 'success', message: `获取到${res.data.data.length}位搭子` });
          resolve();
        } else {
          testResults.push({ test: '获取我的搭子', status: 'fail', message: res.data.msg || '获取失败' });
          reject(new Error('获取我的搭子失败'));
        }
      },
      fail: (err) => {
        testResults.push({ test: '获取我的搭子', status: 'error', message: err.errMsg });
        reject(err);
      }
    });
  });
}

// 7. 测试打卡
function testCreateCheckin() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    if (!token) {
      testResults.push({ test: '打卡', status: 'skip', message: '未登录' });
      resolve();
      return;
    }
    
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/checkins`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        checkinDate: currentDate,
        studyHours: testConfig.studyHours,
        content: '今日测试打卡内容',
        achievement: '完成了测试任务',
        plan: '明天继续测试'
      },
      success: (res) => {
        if (res.data.code === 0) {
          testResults.push({ test: '打卡', status: 'success', message: '打卡成功' });
          resolve();
        } else {
          testResults.push({ test: '打卡', status: 'fail', message: res.data.msg || '打卡失败' });
          reject(new Error('打卡失败'));
        }
      },
      fail: (err) => {
        testResults.push({ test: '打卡', status: 'error', message: err.errMsg });
        reject(err);
      }
    });
  });
}

// 8. 测试获取打卡记录
function testGetCheckinHistory() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    if (!token) {
      testResults.push({ test: '获取打卡记录', status: 'skip', message: '未登录' });
      resolve();
      return;
    }
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/checkins/my`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        page: 1,
        limit: 5
      },
      success: (res) => {
        if (res.data.code === 0) {
          testResults.push({ test: '获取打卡记录', status: 'success', message: `获取到${res.data.data.list.length}条打卡记录` });
          resolve();
        } else {
          testResults.push({ test: '获取打卡记录', status: 'fail', message: res.data.msg || '获取失败' });
          reject(new Error('获取打卡记录失败'));
        }
      },
      fail: (err) => {
        testResults.push({ test: '获取打卡记录', status: 'error', message: err.errMsg });
        reject(err);
      }
    });
  });
}

// 导出测试函数
module.exports = {
  runTests
};

// 如果直接运行该文件，则执行测试
if (typeof __filename !== 'undefined') {
  runTests();
}