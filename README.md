# PBL-PROJECT

# LearnSync - 智能学习任务管理平台

<div align="center">

![LearnSync Logo](https://img.shields.io/badge/LearnSync-智能学习平台-blue?style=for-the-badge&logo=education)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**一个功能完整的纯前端学习任务管理系统，帮助您高效管理和跟踪学习进度**

[在线演示](#) · [文档](#文档) · [更新日志](#更新日志) · [贡献指南](#贡献指南)

</div>

## 📖 目录

- [项目简介](#项目简介)
- [功能特色](#功能特色)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [功能详解](#功能详解)
- [API文档](#api文档)
- [开发指南](#开发指南)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 🎯 项目简介

LearnSync是一个现代化的智能学习任务管理平台，旨在帮助学习者更好地组织、跟踪和优化学习过程。该平台完全基于前端技术构建，无需后端服务器，可直接在浏览器中运行。

### 核心价值

- 📊 **数据驱动**: 通过详细的学习数据分析，帮助您了解学习模式
- 🎯 **目标导向**: 设置学习目标，跟踪完成进度
- 📱 **跨平台**: 响应式设计，支持各种设备访问
- 🔒 **数据安全**: 本地存储，数据完全由您控制
- 🚀 **即开即用**: 无需安装配置，双击即可使用

## ✨ 功能特色

### 👤 用户管理
- ✅ 用户注册/登录系统
- ✅ MD5密码加密存储
- ✅ 角色权限管理（管理员/普通用户）
- ✅ 个人资料管理

### 📋 任务管理
- ✅ 完整的任务CRUD操作
- ✅ 任务优先级设置（高/中/低）
- ✅ 任务状态管理（待办/进行中/已完成）
- ✅ 截止日期提醒和过期警告
- ✅ 拖拽式状态更新
- ✅ 高级筛选和搜索功能
- ✅ 任务标签系统
- ✅ CSV数据导出

### 📚 资源管理
- ✅ 学习资源分类管理
- ✅ 多种资源类型支持（文章、视频、书籍、链接等）
- ✅ 资源标签云系统
- ✅ 收藏和评分功能
- ✅ 访问统计和热门资源推荐
- ✅ 全文搜索和分类筛选

### 📈 进度跟踪
- ✅ 详细的学习时间记录
- ✅ 番茄钟计时器
- ✅ 学习热力图（90天）
- ✅ 进度统计和分析
- ✅ 学习目标设置和跟踪
- ✅ 满意度和难度评估
- ✅ 多维度数据可视化

### 📊 数据可视化
- ✅ 任务状态分布饼图
- ✅ 学习时间趋势图
- ✅ 资源类型分布图
- ✅ 用户活跃度统计
- ✅ 学习进度热力图

### 🛠️ 管理功能
- ✅ 系统概览和实时监控
- ✅ 用户管理（增删改查）
- ✅ 系统统计和报表
- ✅ 数据备份和导出
- ✅ 系统日志记录

### 🎨 用户体验
- ✅ 深色/浅色主题切换
- ✅ 响应式设计
- ✅ 现代化UI界面
- ✅ 流畅的交互动画
- ✅ 键盘快捷键支持
- ✅ 离线可用

## 🛠️ 技术栈

### 前端框架
- **HTML5** - 语义化标记语言
- **CSS3** - 现代样式和动画
- **JavaScript ES6+** - 现代JavaScript特性

### UI框架与库
- **Bootstrap 5** - 响应式UI框架
- **Bootstrap Icons** - 丰富的图标库
- **Chart.js** - 数据可视化图表库

### 工具与库
- **MD5.js** - 密码加密
- **LocalStorage API** - 本地数据存储

### 开发工具
- **模块化架构** - 清晰的代码组织
- **ES6模块** - 现代JavaScript模块系统
- **响应式设计** - 移动端优先

## 📁 项目结构

```
LearnSync/
├── index.html                    # 登录页面
├── register.html                 # 注册页面
├── README.md                     # 项目文档
├── css/                          # 样式文件目录
│   ├── style.css                # 主题和通用样式
│   ├── auth.css                 # 认证页面样式
│   └── dashboard.css            # 仪表板样式
├── js/                          # JavaScript模块目录
│   ├── storage.js               # 数据存储管理
│   ├── auth.js                  # 用户认证管理
│   ├── taskManager.js           # 任务管理模块
│   ├── resourceManager.js       # 资源管理模块
│   ├── progressTracker.js       # 进度跟踪模块
│   └── chartUtils.js            # 图表工具模块
├── lib/                         # 第三方库目录
│   ├── md5.min.js               # MD5加密库
│   └── chart.min.js             # Chart.js图表库
├── user/                        # 用户界面目录
│   ├── dashboard.html           # 用户仪表板
│   ├── tasks.html               # 任务管理页面
│   ├── resources.html           # 资源管理页面
│   └── progress.html            # 进度跟踪页面
└── admin/                       # 管理员界面目录
    ├── index.html               # 管理员仪表板
    ├── users.html               # 用户管理页面
    ├── stats.html               # 系统统计页面
    └── tasks.html               # 任务管理页面
```

## 🚀 快速开始

### 环境要求

- 现代浏览器（Chrome 70+、Firefox 65+、Safari 12+、Edge 79+）
- 无需任何服务器环境

### 安装运行

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/LearnSync.git
   cd LearnSync
   ```

2. **直接运行**
   - 双击 `index.html` 文件
   - 或在浏览器中打开 `index.html`

3. **使用本地服务器（可选）**
   ```bash
   # 使用Python
   python -m http.server 8000

   # 使用Node.js
   npx serve .

   # 使用Live Server（VS Code插件）
   # 右键index.html → Open with Live Server
   ```

4. **访问应用**
   - 打开浏览器访问：`http://localhost:8000`
   - 或直接双击index.html文件

### 默认账号

系统预置了以下测试账号：

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin | 管理员 | 系统管理员账号 |
| demo | demo | 普通用户 | 演示用户账号 |

## 📖 使用指南

### 首次使用

1. **注册账号**：在登录页面点击"立即注册"创建新账号
2. **登录系统**：使用注册的账号登录
3. **创建任务**：在任务页面创建您的第一个学习任务
4. **添加资源**：在资源库页面添加学习资料
5. **记录进度**：在进度页面记录学习时间和心得

### 主要功能使用

#### 任务管理
1. 创建任务：设置标题、描述、优先级和截止日期
2. 状态管理：拖拽任务卡片更新状态
3. 筛选搜索：按状态、优先级、关键词筛选任务
4. 时间记录：记录每个任务的学习时间

#### 资源管理
1. 添加资源：保存有用的学习链接和资料
2. 分类管理：为资源设置类型和标签
3. 搜索查找：快速找到需要的资源
4. 收藏评分：标记重要资源并评分

#### 进度跟踪
1. 时间记录：使用番茄钟记录专注学习时间
2. 进度统计：查看学习热力图和时间趋势
3. 目标设定：设置每日、每周、每月学习目标
4. 数据分析：了解学习效率和模式

### 高级功能

#### 管理员功能
- 用户管理：查看和管理所有用户账号
- 系统监控：实时监控系统状态和用户活动
- 数据导出：备份和导出系统数据
- 统计报表：生成详细的系统统计报表

#### 数据管理
- 本地存储：所有数据保存在浏览器本地
- 数据导出：支持CSV和JSON格式导出
- 数据备份：定期备份重要数据
- 数据恢复：通过导入功能恢复数据

## 🔧 功能详解

### 用户认证系统

LearnSync采用基于Session的用户认证机制：

```javascript
// 用户登录流程
const result = Auth.login(username, password, rememberMe);
if (result.success) {
    // 登录成功，重定向到相应页面
    window.location.href = user.role === 'admin' ?
        'admin/index.html' : 'user/dashboard.html';
}
```

**安全特性：**
- MD5密码加密存储
- Session管理登录状态
- 角色权限验证
- 自动登出机制

### 数据存储系统

使用LocalStorage实现客户端数据持久化：

```javascript
// 数据存储结构
const data = {
    users: [...],           // 用户数据
    tasks: [...],           // 任务数据
    resources: [...],       // 资源数据
    progress: [...]         // 进度数据
};

// 存储到LocalStorage
Storage.set('users', userData);
```

**存储特点：**
- JSON格式存储
- 自动版本管理
- 数据完整性验证
- 支持数据导入导出

### 任务管理核心

任务管理支持完整的生命周期管理：

```javascript
// 创建任务
const result = TaskManager.createTask({
    title: '学习JavaScript基础',
    description: '完成JS基础知识学习',
    priority: 'High',
    deadline: '2024-12-31T23:59:59',
    userId: currentUser.id,
    status: 'Todo'
});

// 更新任务状态
TaskManager.updateTask(taskId, { status: 'InProgress' });
```

### 进度跟踪算法

学习进度采用多维度统计方法：

```javascript
// 计算学习统计
const stats = ProgressTracker.getProgressStats(userId);
/*
返回数据结构：
{
    totalRecords: 150,
    totalTimeSpent: 7200,     // 总学习时间（分钟）
    averageTimeSpent: 48,     // 平均学习时间
    averageSatisfaction: 4.2,  // 平均满意度
    byDifficulty: {...},      // 按难度统计
    bySatisfaction: {...},    // 按满意度统计
    dailyStats: {...},        // 每日统计
    weeklyStats: {...},       // 每周统计
    monthlyStats: {...}       // 每月统计
}
*/
```

### 图表可视化

使用Chart.js实现丰富的数据可视化：

```javascript
// 创建任务状态饼图
ChartUtils.createTaskStatusPieChart('chartCanvas', taskStats, {
    title: '任务状态分布',
    responsive: true,
    maintainAspectRatio: false
});

// 创建学习时间趋势图
ChartUtils.createLearningTimeLineChart('trendCanvas', progressData, {
    timeUnit: 'day',
    smooth: true
});
```

## 📚 API文档

### Storage API

数据存储的核心API，提供CRUD操作：

```javascript
// 基础操作
Storage.get(key, defaultValue)     // 获取数据
Storage.set(key, data)             // 保存数据
Storage.add(key, item)             // 添加记录
Storage.update(key, id, updates)   // 更新记录
Storage.delete(key, id)            // 删除记录

// 查询操作
Storage.getById(key, id)           // 根据ID获取
Storage.find(key, predicate)       // 条件查询
Storage.search(key, query, fields) // 全文搜索

// 工具方法
Storage.exportData(key, format)    // 导出数据
Storage.importData(key, data, merge) // 导入数据
```

### Auth API

用户认证相关API：

```javascript
// 用户认证
Auth.register(username, email, password, role)  // 用户注册
Auth.login(username, password, rememberMe)      // 用户登录
Auth.logout()                                    // 用户登出

// 状态检查
Auth.isLoggedIn()                                // 检查登录状态
Auth.getCurrentUser()                             // 获取当前用户
Auth.isAdmin()                                   // 检查管理员权限

// 用户管理
Auth.getAllUsers()                               // 获取所有用户
Auth.setUserStatus(userId, isActive)           // 设置用户状态
Auth.setUserRole(userId, role)                 // 修改用户角色
```

### TaskManager API

任务管理API：

```javascript
// 任务CRUD
TaskManager.createTask(taskData)               // 创建任务
TaskManager.getTask(taskId, userId)           // 获取任务
TaskManager.updateTask(taskId, updates, userId) // 更新任务
TaskManager.deleteTask(taskId, userId)       // 删除任务

// 任务查询
TaskManager.getUserTasks(userId, filters)     // 获取用户任务
TaskManager.getUpcomingDeadlines(userId, days) // 即将到期任务
TaskManager.searchTasks(userId, query, fields) // 搜索任务

// 任务统计
TaskManager.getTaskStats(userId)              // 任务统计
TaskManager.exportTasks(userId, format)        // 导出任务

// 时间记录
TaskManager.recordTime(taskId, minutes, userId) // 记录时间
```

### ProgressTracker API

进度跟踪API：

```javascript
// 进度CRUD
ProgressTracker.createProgress(progressData)     // 创建进度
ProgressTracker.getProgress(progressId, userId)   // 获取进度
ProgressTracker.updateProgress(progressId, updates, userId) // 更新进度
ProgressTracker.deleteProgress(progressId, userId) // 删除进度

// 进度查询
ProgressTracker.getUserProgress(userId, filters) // 获取用户进度
ProgressTracker.getHeatmapData(userId, days)     // 获取热力图数据
ProgressTracker.searchProgress(userId, query)    // 搜索进度

// 进度统计
ProgressTracker.getProgressStats(userId, dateRange) // 进度统计
ProgressTracker.getGoalProgress(userId, goals)   // 目标进度
ProgressTracker.exportProgress(userId, format)    // 导出进度
```

### ResourceManager API

资源管理API：

```javascript
// 资源CRUD
ResourceManager.createResource(resourceData)     // 创建资源
ResourceManager.getResource(resourceId, userId)   // 获取资源
ResourceManager.updateResource(resourceId, updates, userId) // 更新资源
ResourceManager.deleteResource(resourceId, userId) // 删除资源

// 资源查询
ResourceManager.getUserResources(userId, filters) // 获取用户资源
ResourceManager.searchResources(userId, query)    // 搜索资源
ResourceManager.getRecommendedResources(userId, limit) // 推荐资源

// 资源统计
ResourceManager.getResourceStats(userId)         // 资源统计
ResourceManager.getAllTags(userId)               // 获取标签
ResourceManager.exportResources(userId, format)   // 导出资源

// 资源操作
ResourceManager.recordAccess(resourceId, userId)   // 记录访问
ResourceManager.toggleFavorite(resourceId, userId) // 切换收藏
```

### ChartUtils API

图表工具API：

```javascript
// 创建图表
ChartUtils.createTaskStatusPieChart(canvasId, stats, options)   // 任务状态饼图
ChartUtils.createLearningTimeLineChart(canvasId, data, options) // 学习时间折线图
ChartUtils.createPriorityBarChart(canvasId, stats, options)    // 优先级条形图
ChartUtils.createLearningHeatmap(canvasId, data, options)       // 学习热力图
ChartUtils.createResourceTypePieChart(canvasId, stats, options) // 资源类型饼图

// 图表管理
ChartUtils.destroyChart(canvasId)        // 销毁图表
ChartUtils.destroyAllCharts()            // 销毁所有图表
ChartUtils.updateChart(canvasId, data)   // 更新图表数据
ChartUtils.exportChartAsImage(canvasId, filename) // 导出图表
ChartUtils.setChartTheme(theme)          // 设置图表主题
```

## 🔧 开发指南

### 开发环境设置

1. **代码编辑器**
   - 推荐使用Visual Studio Code
   - 安装Live Server插件用于本地开发
   - 安装Prettier插件用于代码格式化

2. **浏览器调试**
   - 使用Chrome DevTools进行调试
   - 打开开发者工具查看Console和Network
   - 使用Application面板查看LocalStorage

3. **代码规范**
   - 使用ES6+语法
   - 遵循驼峰命名规则
   - 添加详细的JSDoc注释
   - 保持代码整洁和可读性

### 项目架构

LearnSync采用模块化架构设计：

```
┌─────────────────┐    ┌─────────────────┐
│   用户界面       │    │   管理界面      │
│   (user/*.html) │    │  (admin/*.html) │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────────┐
          │    核心模块层        │
          │   (js/*.js)         │
          └──────────┬──────────┘
                     │
          ┌─────────────────────┐
          │   数据存储层         │
          │   (LocalStorage)    │
          └─────────────────────┘
```

### 添加新功能

1. **创建新的模块**
   ```javascript
   class NewFeatureManager {
       constructor() {
           this.storageKey = 'ls_newfeature';
       }

       createFeature(data) {
           // 实现功能逻辑
           return Storage.add(this.storageKey, data);
       }

       getFeatures(userId) {
           return Storage.find(this.storageKey, f => f.userId === userId);
       }
   }

   const NewFeature = new NewFeatureManager();
   ```

2. **添加新的页面**
   ```html
   <!-- newpage.html -->
   <!DOCTYPE html>
   <html lang="zh-CN">
   <head>
       <!-- 引入必要的CSS和JS -->
       <link href="../css/style.css" rel="stylesheet">
       <script src="../js/auth.js"></script>
   </head>
   <body>
       <!-- 页面内容 -->
       <script>
           // 页面脚本
           document.addEventListener('DOMContentLoaded', function() {
               if (!Auth.isLoggedIn()) {
                   window.location.href = '../index.html';
                   return;
               }
               // 初始化页面
           });
       </script>
   </body>
   </html>
   ```

3. **扩展样式**
   ```css
   /* 在style.css中添加新样式 */
   .new-feature-component {
       background-color: var(--card-bg);
       border: 1px solid var(--border-color);
       border-radius: 0.75rem;
       padding: 1rem;
   }
   ```

### 调试技巧

1. **Console调试**
   ```javascript
   // 在浏览器Console中直接调用API
   Auth.getCurrentUser()
   TaskManager.getUserTasks('user-id')
   Storage.get('tasks')
   ```

2. **断点调试**
   ```javascript
   // 在代码中添加断点
   debugger;
   console.log('Debug info:', data);
   ```

3. **错误处理**
   ```javascript
   try {
       const result = TaskManager.createTask(taskData);
       if (result.success) {
           // 成功处理
       } else {
           console.error('创建任务失败:', result.message);
       }
   } catch (error) {
       console.error('系统错误:', error);
   }
   ```

### 性能优化

1. **数据缓存**
   ```javascript
   // 缓存常用数据
   let cachedTasks = null;

   function getCachedTasks(userId) {
       if (!cachedTasks) {
           cachedTasks = TaskManager.getUserTasks(userId);
       }
       return cachedTasks;
   }
   ```

2. **懒加载**
   ```javascript
   // 按需加载数据
   function loadTasksOnDemand() {
       const container = document.getElementById('tasks');
       if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
           loadMoreTasks();
       }
   }
   ```

3. **防抖搜索**
   ```javascript
   // 搜索防抖
   let searchTimeout;

   function handleSearch() {
       clearTimeout(searchTimeout);
       searchTimeout = setTimeout(() => {
           performSearch();
       }, 300);
   }
   ```

## ❓ 常见问题

### Q: 数据会丢失吗？
A: 所有数据都存储在浏览器的LocalStorage中，清除浏览器数据会导致数据丢失。建议定期使用导出功能备份数据。

### Q: 支持多浏览器吗？
A: 支持所有现代浏览器（Chrome、Firefox、Safari、Edge），推荐使用Chrome获得最佳体验。

### Q: 如何备份数据？
A: 在管理员仪表板或相关页面点击"导出"按钮，选择JSON或CSV格式导出数据。

### Q: 可以多设备同步吗？
A: 目前不支持多设备自动同步，但可以通过导出/导入功能在不同设备间转移数据。

### Q: 如何修改主题颜色？
A: 在`css/style.css`文件中修改CSS变量定义的配色方案。

### Q: 支持导入导出什么格式？
A: 支持JSON格式（完整数据）和CSV格式（表格数据）的导入导出。

### Q: 如何扩展功能？
A: 可以按照现有的模块化架构添加新的功能模块，参考开发指南部分。

### Q: 遇到Bug怎么办？
A: 可以在GitHub Issues中提交问题，或查看Console错误信息进行调试。

## 📋 更新日志

#### ✨ 新功能
- 完整的用户认证系统
- 任务管理功能
- 资源管理功能
- 进度跟踪功能
- 管理员功能
- 数据可视化图表
- 深色/浅色主题切换
- 响应式设计
- 数据导入导出

#### 🐛 问题修复
- 修复了移动端显示问题
- 优化了性能和加载速度
- 改进了用户体验

#### 🔄 优化改进
- 代码重构，提高可维护性
- 添加了详细的错误处理
- 优化了数据存储结构
- 改进了用户界面交互

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork项目**
   ```bash
   git clone https://github.com/yang-han-609/PBL-PROJECT.git
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **提交更改**
   ```bash
   git commit -m 'Add some amazing feature'
   ```

4. **推送到分支**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **创建Pull Request**

### 贡献类型

- 🐛 **Bug修复**: 修复已知问题
- ✨ **新功能**: 添加新的功能特性
- 📚 **文档**: 改进文档和注释
- 🎨 **设计**: 改进UI/UX设计
- ⚡ **性能**: 优化性能和加载速度
- 🧪 **测试**: 添加或改进测试

### 代码规范

- 使用ES6+语法
- 遵循现有的代码风格
- 添加适当的注释
- 确保代码可读性
- 测试功能正常工作

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目和工具：

- [Bootstrap](https://getbootstrap.com/) - 响应式CSS框架
- [Chart.js](https://www.chartjs.org/) - 数据可视化图表库
- [Bootstrap Icons](https://icons.getbootstrap.com/) - 图标库
- [MD5.js](https://github.com/blueimp/JavaScript-MD5) - MD5加密库

## 📞 联系我们
### 小组成员
-  杨  涵 2024302010609
-  杨鸿辉 2024302010608
-  吴钧辉 2024302010613

---

<div align="center">

**[⬆ 回到顶部](#learnsync---智能学习任务管理平台)**

Made with ❤️ by [Your Name](https://github.com/yourusername)

</div>