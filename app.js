const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 导入统一响应处理工具
const { errorResponse, serverErrorResponse, successResponse } = require('./utils/responseHandler');

// 导入路由
const userRoutes = require('./routes/userRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const planRoutes = require('./routes/planRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const errorBookRoutes = require('./routes/errorBookRoutes');
const dailyPointRoutes = require('./routes/dailyPointRoutes');
const examTeamRoutes = require('./routes/examTeamRoutes');
const dataAnalysisRoutes = require('./routes/dataAnalysisRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// 导入分层监督服务
const { initSupervisionScheduler } = require('./utils/supervisionService');
// 导入保证金服务
const { initDepositScheduler } = require('./utils/depositService');
// 导入数据库初始化工具
const { initializeDatabase, initializeRedisCache } = require('./utils/dbInitializer');
// 导入Redis客户端
const { redisClient } = require('./config/dbConfig');

// 初始化分层监督定时任务
initSupervisionScheduler();
// 初始化保证金结算定时任务
initDepositScheduler();

// 初始化数据库表
initializeDatabase().catch(error => {
  console.error('数据库初始化失败:', error);
});

// 初始化Redis缓存策略
redisClient.connect().then(async () => {
  try {
    await initializeRedisCache(redisClient);
  } catch (error) {
    console.error('Redis缓存初始化失败:', error);
  }
}).catch(error => {
  console.error('Redis连接失败:', error);
});

// 初始化Express应用
const app = express();

// 中间件配置
app.use(helmet()); // 安全头设置
app.use(cors()); // 跨域配置
app.use(bodyParser.json()); // JSON解析
app.use(bodyParser.urlencoded({ extended: true })); // URL编码解析
app.use(morgan('dev')); // 请求日志

// 添加一个简单的根路由，用于验证服务
app.get('/', (req, res) => {
  return successResponse(res, {
    message: '省考搭子小程序后端服务运行正常',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users/*',
      partners: '/api/partners/*'
    }
  }, '省考搭子小程序后端服务运行正常');
});

// 健康检查路由
app.get('/health', (req, res) => {
  return successResponse(res, { status: 'ok' }, 'Exam Partner Backend is running');
});

// API路由
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/errorbook', errorBookRoutes);
app.use('/api/daily-point', dailyPointRoutes);
app.use('/api/exam-team', examTeamRoutes);
app.use('/api/data-analysis', dataAnalysisRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404处理
app.use((req, res) => {
  return errorResponse(res, '请求的资源不存在', 404, 404);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    // 验证错误
    return errorResponse(res, '参数验证失败', 4001, 400);
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    // 认证错误
    return errorResponse(res, '未授权或无效的令牌', 4002, 401);
  } else if (err.name === 'ForbiddenError') {
    // 权限错误
    return errorResponse(res, '没有权限访问该资源', 4003, 403);
  } else if (err.status === 404) {
    // 资源不存在
    return errorResponse(res, '请求的资源不存在', 4004, 404);
  } else {
    // 服务器内部错误
    return serverErrorResponse(res, err, '服务器内部错误');
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;