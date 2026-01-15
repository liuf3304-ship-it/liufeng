// API测试脚本
const API_BASE_URL = 'https://liufeng-dazi-v1.vercel.app/api';

// 测试配置
const testConfig = {
  phone: '13800138000',
  code: '123456',
  nickname: '测试用户',
  examType: '考研',
  examDate: '2024-12-23',
  studyHours: 6
};

// 测试结果
let testResults = [];
let token = '';

// 发送请求的通用方法
async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method: options.method || 'GET',
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      data: options.data,
      success: resolve,
      fail: reject
    });
  });
}

// 测试发送验证码
async function testSendCode() {
  console.log('1. 测试发送验证码...');
  try {
    const res = await request('/users/send-code', {
      method: 'POST',
      data: { phone: testConfig.phone }
    });
    
    if (res.data.code === 0) {
      testResults.push({ test: '发送验证码', status: 'success', message: '验证码发送成功' });
      console.log('✅ 发送验证码成功');
    } else {
      testResults.push({ test: '发送验证码', status: 'fail', message: res.data.msg || '发送失败' });
      console.log('❌ 发送验证码失败:', res.data.msg);
    }
  } catch (error) {
    testResults.push({ test: '发送验证码', status: 'error', message: error.errMsg });
    console.log('❌ 发送验证码错误:', error.errMsg);
  }
}

// 测试手机号登录
async function testPhoneLogin() {
  console.log('2. 测试手机号登录...');
  try {
    const res = await request('/users/login/phone', {
      method: 'POST',
      data: { phone: testConfig.phone, code: testConfig.code }
    });
    
    if (res.data.code === 0) {
      token = res.data.data.token;
      testResults.push({ test: '手机号登录', status: 'success', message: '登录成功' });
      console.log('✅ 手机号登录成功');
    } else {
      testResults.push({ test: '手机号登录', status: 'fail', message: res.data.msg || '登录失败' });
      console.log('❌ 手机号登录失败:', res.data.msg);
    }
  } catch (error) {
    testResults.push({ test: '手机号登录', status: 'error', message: error.errMsg });
    console.log('❌ 手机号登录错误:', error.errMsg);
  }
}

// 测试获取用户信息
async function testGetUserInfo() {
  console.log('3. 测试获取用户信息...');
  if (!token) {
    testResults.push({ test: '获取用户信息', status: 'skip', message: '未登录' });
    console.log('⏭️  获取用户信息跳过，未登录');
    return;
  }
  
  try {
    const res = await request('/users/profile', {
      header: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.data.code === 0) {
      testResults.push({ test: '获取用户信息', status: 'success', message: '获取成功' });
      console.log('✅ 获取用户信息成功');
    } else {
      testResults.push({ test: '获取用户信息', status: 'fail', message: res.data.msg || '获取失败' });
      console.log('❌ 获取用户信息失败:', res.data.msg);
    }
  } catch (error) {
    testResults.push({ test: '获取用户信息', status: 'error', message: error.errMsg });
    console.log('❌ 获取用户信息错误:', error.errMsg);
  }
}

// 测试更新用户信息
async function testUpdateUserInfo() {
  console.log('4. 测试更新用户信息...');
  if (!token) {
    testResults.push({ test: '更新用户信息', status: 'skip', message: '未登录' });
    console.log('⏭️  更新用户信息跳过，未登录');
    return;
  }
  
  try {
    const res = await request('/users/profile', {
      method: 'PUT',
      header: { 'Authorization': `Bearer ${token}` },
      data: {
        nickname: testConfig.nickname,
        examType: testConfig.examType,
        examDate: testConfig.examDate,
        studyHours: testConfig.studyHours,
        selfIntroduction: '这是一个测试用户的自我介绍'
      }
    });
    
    if (res.data.code === 0) {
      testResults.push({ test: '更新用户信息', status: 'success', message: '更新成功' });
      console.log('✅ 更新用户信息成功');
    } else {
      testResults.push({ test: '更新用户信息', status: 'fail', message: res.data.msg || '更新失败' });
      console.log('❌ 更新用户信息失败:', res.data.msg);
    }
  } catch (error) {
    testResults.push({ test: '更新用户信息', status: 'error', message: error.errMsg });
    console.log('❌ 更新用户信息错误:', error.errMsg);
  }
}

// 测试获取推荐搭子
async function testGetRecommendPartners() {
  console.log('5. 测试获取推荐搭子...');
  if (!token) {
    testResults.push({ test: '获取推荐搭子', status: 'skip', message: '未登录' });
    console.log('⏭️  获取推荐搭子跳过，未登录');
    return;
  }
  
  try {
    const res = await request('/partners/recommend', {
      header: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.data.code === 0) {
      testResults.push({ test: '获取推荐搭子', status: 'success', message: `获取到${res.data.data.length}位搭子` });
      console.log(`✅ 获取推荐搭子成功，共${res.data.data.length}位`);
    } else {
      testResults.push({ test: '获取推荐搭子', status: 'fail', message: res.data.msg || '获取失败' });
      console.log('❌ 获取推荐搭子失败:', res.data.msg);
    }
  } catch (error) {
    testResults.push({ test: '获取推荐搭子', status: 'error', message: error.errMsg });
    console.log('❌ 获取推荐搭子错误:', error.errMsg);
  }
}

// 测试获取我的搭子
async function testGetMyPartners() {
  console.log('6. 测试获取我的搭子...');
  if (!token) {
    testResults.push({ test: '获取我的搭子', status: 'skip', message: '未登录' });
    console.log('⏭️  获取我的搭子跳过，未登录');
    return;
  }
  
  try {
    const res = await request('/partners/my', {
      header: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.data.code === 0) {
      testResults.push({ test: '获取我的搭子', status: 'success', message: `获取到${res.data.data.length}位搭子` });
      console.log(`✅ 获取我的搭子成功，共${res.data.data.length}位`);
    } else {
      testResults.push({ test: '获取我的搭子', status: 'fail', message: res.data.msg || '获取失败' });
      console.log('❌ 获取我的搭子失败:', res.data.msg);
    }
  } catch (error) {
    testResults.push({ test: '获取我的搭子', status: 'error', message: error.errMsg });
    console.log('❌ 获取我的搭子错误:', error.errMsg);
  }
}

// 测试打卡
async function testCreateCheckin() {
  console.log('7. 测试打卡...');
  if (!token) {
    testResults.push({ test: '打卡', status: 'skip', message: '未登录' });
    console.log('⏭️  打卡跳过，未登录');
    return;
  }
  
  try {
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    const res = await request('/checkins', {
      method: 'POST',
      header: { 'Authorization': `Bearer ${token}` },
      data: {
        checkinDate: currentDate,
        studyHours: testConfig.studyHours,
        content: '今日测试打卡内容',
        achievement: '完成了测试任务',
        plan: '明天继续测试'
      }
    });
    
    if (res.data.code === 0) {
      testResults.push({ test: '打卡', status: 'success', message: '打卡成功' });
      console.log('✅ 打卡成功');
    } else {
      testResults.push({ test: '打卡', status: 'fail', message: res.data.msg || '打卡失败' });
      console.log('❌ 打卡失败:', res.data.msg);
    }
  } catch (error) {
    testResults.push({ test: '打卡', status: 'error', message: error.errMsg });
    console.log('❌ 打卡错误:', error.errMsg);
  }
}

// 测试获取打卡记录
async function testGetCheckinHistory() {
  console.log('8. 测试获取打卡记录...');
  if (!token) {
    testResults.push({ test: '获取打卡记录', status: 'skip', message: '未登录' });
    console.log('⏭️  获取打卡记录跳过，未登录');
    return;
  }
  
  try {
    const res = await request('/checkins/my', {
      header: { 'Authorization': `Bearer ${token}` },
      data: {
        page: 1,
        limit: 5
      }
    });
    
    if (res.data.code === 0) {
      testResults.push({ test: '获取打卡记录', status: 'success', message: `获取到${res.data.data.list.length}条打卡记录` });
      console.log(`✅ 获取打卡记录成功，共${res.data.data.list.length}条`);
    } else {
      testResults.push({ test: '获取打卡记录', status: 'fail', message: res.data.msg || '获取失败' });
      console.log('❌ 获取打卡记录失败:', res.data.msg);
    }
  } catch (error) {
    testResults.push({ test: '获取打卡记录', status: 'error', message: error.errMsg });
    console.log('❌ 获取打卡记录错误:', error.errMsg);
  }
}

// 主测试函数
async function runTests() {
  console.log('开始测试备考搭子小程序API接口...');
  console.log(`API基础URL: ${API_BASE_URL}`);
  console.log('===========================================');
  
  // 1. 测试发送验证码
  await testSendCode();
  
  // 2. 测试手机号登录
  await testPhoneLogin();
  
  // 3. 测试获取用户信息
  await testGetUserInfo();
  
  // 4. 测试更新用户信息
  await testUpdateUserInfo();
  
  // 5. 测试获取推荐搭子
  await testGetRecommendPartners();
  
  // 6. 测试获取我的搭子
  await testGetMyPartners();
  
  // 7. 测试打卡
  await testCreateCheckin();
  
  // 8. 测试获取打卡记录
  await testGetCheckinHistory();
  
  console.log('===========================================');
  console.log('测试完成！');
  console.log('测试结果:');
  
  // 统计测试结果
  const successCount = testResults.filter(result => result.status === 'success').length;
  const failCount = testResults.filter(result => result.status === 'fail').length;
  const errorCount = testResults.filter(result => result.status === 'error').length;
  const skipCount = testResults.filter(result => result.status === 'skip').length;
  
  testResults.forEach((result, index) => {
    const statusIcon = {
      success: '✅',
      fail: '❌',
      error: '❌',
      skip: '⏭️'
    }[result.status];
    console.log(`${statusIcon} ${index + 1}. ${result.test}: ${result.message}`);
  });
  
  console.log('===========================================');
  console.log(`总测试数: ${testResults.length}`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);
  console.log(`错误: ${errorCount}`);
  console.log(`跳过: ${skipCount}`);
  
  if (successCount === testResults.length) {
    console.log('🎉 所有测试都成功了！前后端联调正常。');
  } else {
    console.log('⚠️  有测试失败或出错，请检查API接口配置。');
  }
}

// 执行测试
runTests();