/**
 * LearnSync - 智能学习任务管理平台
 * 进度跟踪模块
 * 提供学习进度的记录、统计和可视化功能
 */

/**
 * 进度跟踪类
 */
class ProgressTracker {
    constructor() {
        this.storageKey = 'progress';
        this.taskKey = 'tasks';
    }

    /**
     * 创建进度记录
     * @param {Object} progressData - 进度数据
     * @returns {Object} 创建结果
     */
    createProgress(progressData) {
        try {
            // 验证必需字段
            if (!progressData.userId || !progressData.taskId) {
                return {
                    success: false,
                    message: '用户ID和任务ID不能为空'
                };
            }

            // 验证任务是否存在
            const task = Storage.getById(this.taskKey, progressData.taskId);
            if (!task) {
                return {
                    success: false,
                    message: '任务不存在'
                };
            }

            // 验证权限
            if (task.userId !== progressData.userId) {
                return {
                    success: false,
                    message: '无权限访问此任务'
                };
            }

            // 验证时间
            if (progressData.timeSpent && (progressData.timeSpent < 0 || progressData.timeSpent > 24 * 60)) {
                return {
                    success: false,
                    message: '学习时间必须在0-1440分钟之间'
                };
            }

            // 创建进度记录
            const newProgress = {
                userId: progressData.userId,
                taskId: progressData.taskId,
                completedAt: progressData.completedAt || new Date().toISOString(),
                notes: progressData.notes ? progressData.notes.trim() : '',
                timeSpent: progressData.timeSpent || 0,
                progressType: progressData.progressType || 'manual', // manual, auto, timer
                difficulty: progressData.difficulty || '', // easy, medium, hard
                satisfaction: progressData.satisfaction || 3, // 1-5满意度
                tags: Array.isArray(progressData.tags) ? progressData.tags : []
            };

            const result = Storage.add(this.storageKey, newProgress);

            if (result) {
                // 更新任务的总用时
                this.updateTaskTotalTime(progressData.taskId);

                return {
                    success: true,
                    message: '进度记录创建成功！',
                    progress: result
                };
            } else {
                return {
                    success: false,
                    message: '进度记录创建失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('创建进度记录失败:', error);
            return {
                success: false,
                message: '进度记录创建失败，系统错误'
            };
        }
    }

    /**
     * 获取用户的进度记录
     * @param {string} userId - 用户ID
     * @param {Object} filters - 筛选条件
     * @returns {Array} 进度记录列表
     */
    getUserProgress(userId, filters = {}) {
        try {
            let progress = Storage.find(this.storageKey, p => p.userId === userId);

            // 应用筛选条件
            if (filters.taskId) {
                progress = progress.filter(p => p.taskId === filters.taskId);
            }

            if (filters.progressType) {
                progress = progress.filter(p => p.progressType === filters.progressType);
            }

            if (filters.difficulty) {
                progress = progress.filter(p => p.difficulty === filters.difficulty);
            }

            if (filters.satisfaction) {
                progress = progress.filter(p => p.satisfaction >= filters.satisfaction);
            }

            if (filters.tags && filters.tags.length > 0) {
                progress = progress.filter(p =>
                    filters.tags.some(tag => p.tags.includes(tag))
                );
            }

            // 日期范围筛选
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                progress = progress.filter(p => new Date(p.completedAt) >= fromDate);
            }

            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                progress = progress.filter(p => new Date(p.completedAt) <= toDate);
            }

            // 搜索筛选
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                progress = progress.filter(p =>
                    p.notes.toLowerCase().includes(searchTerm)
                );
            }

            // 排序
            const sortBy = filters.sortBy || 'completedAt';
            const sortOrder = filters.sortOrder || 'desc';

            progress.sort((a, b) => {
                let compareValue = 0;

                switch (sortBy) {
                    case 'timeSpent':
                        compareValue = (a.timeSpent || 0) - (b.timeSpent || 0);
                        break;
                    case 'satisfaction':
                        compareValue = (a.satisfaction || 0) - (b.satisfaction || 0);
                        break;
                    case 'completedAt':
                    default:
                        compareValue = new Date(a.completedAt) - new Date(b.completedAt);
                        break;
                }

                return sortOrder === 'desc' ? -compareValue : compareValue;
            });

            return progress;
        } catch (error) {
            console.error('获取用户进度失败:', error);
            return [];
        }
    }

    /**
     * 获取单个进度记录
     * @param {string} progressId - 进度记录ID
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object|null} 进度记录或null
     */
    getProgress(progressId, userId = null) {
        try {
            const progress = Storage.getById(this.storageKey, progressId);

            if (!progress) {
                return null;
            }

            // 如果提供了用户ID，验证权限
            if (userId && progress.userId !== userId) {
                return null;
            }

            return progress;
        } catch (error) {
            console.error('获取进度记录失败:', error);
            return null;
        }
    }

    /**
     * 更新进度记录
     * @param {string} progressId - 进度记录ID
     * @param {Object} updates - 更新数据
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 更新结果
     */
    updateProgress(progressId, updates, userId = null) {
        try {
            const progress = this.getProgress(progressId, userId);
            if (!progress) {
                return {
                    success: false,
                    message: '进度记录不存在或无权限访问'
                };
            }

            // 验证和清理更新数据
            const allowedUpdates = {};
            const allowedFields = [
                'completedAt', 'notes', 'timeSpent', 'difficulty',
                'satisfaction', 'tags', 'progressType'
            ];

            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    allowedUpdates[key] = updates[key];
                }
            });

            // 验证时间
            if (allowedUpdates.timeSpent && (allowedUpdates.timeSpent < 0 || allowedUpdates.timeSpent > 24 * 60)) {
                return {
                    success: false,
                    message: '学习时间必须在0-1440分钟之间'
                };
            }

            // 验证难度
            if (allowedUpdates.difficulty) {
                const validDifficulties = ['easy', 'medium', 'hard'];
                if (!validDifficulties.includes(allowedUpdates.difficulty)) {
                    return {
                        success: false,
                        message: '无效的难度级别'
                    };
                }
            }

            // 验证满意度
            if (allowedUpdates.satisfaction !== undefined) {
                if (typeof allowedUpdates.satisfaction !== 'number' ||
                    allowedUpdates.satisfaction < 1 || allowedUpdates.satisfaction > 5) {
                    return {
                        success: false,
                        message: '满意度必须在1-5之间'
                    };
                }
            }

            // 验证进度类型
            if (allowedUpdates.progressType) {
                const validTypes = ['manual', 'auto', 'timer'];
                if (!validTypes.includes(allowedUpdates.progressType)) {
                    return {
                        success: false,
                        message: '无效的进度类型'
                    };
                }
            }

            // 验证日期
            if (allowedUpdates.completedAt) {
                const completedAt = new Date(allowedUpdates.completedAt);
                if (isNaN(completedAt.getTime())) {
                    return {
                        success: false,
                        message: '无效的完成时间'
                    };
                }
                allowedUpdates.completedAt = completedAt.toISOString();
            }

            // 验证标签
            if (allowedUpdates.tags) {
                if (!Array.isArray(allowedUpdates.tags)) {
                    allowedUpdates.tags = [];
                }
            }

            // 清理笔记
            if (allowedUpdates.notes) {
                allowedUpdates.notes = allowedUpdates.notes.trim();
            }

            const result = Storage.update(this.storageKey, progressId, allowedUpdates);

            if (result) {
                // 更新任务的总用时
                this.updateTaskTotalTime(progress.taskId);

                return {
                    success: true,
                    message: '进度记录更新成功！',
                    progress: result
                };
            } else {
                return {
                    success: false,
                    message: '进度记录更新失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('更新进度记录失败:', error);
            return {
                success: false,
                message: '进度记录更新失败，系统错误'
            };
        }
    }

    /**
     * 删除进度记录
     * @param {string} progressId - 进度记录ID
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 删除结果
     */
    deleteProgress(progressId, userId = null) {
        try {
            const progress = this.getProgress(progressId, userId);
            if (!progress) {
                return {
                    success: false,
                    message: '进度记录不存在或无权限访问'
                };
            }

            const taskId = progress.taskId;
            const success = Storage.delete(this.storageKey, progressId);

            if (success) {
                // 更新任务的总用时
                this.updateTaskTotalTime(taskId);

                return {
                    success: true,
                    message: '进度记录删除成功！'
                };
            } else {
                return {
                    success: false,
                    message: '进度记录删除失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('删除进度记录失败:', error);
            return {
                success: false,
                message: '进度记录删除失败，系统错误'
            };
        }
    }

        /**
     * 获取进度统计信息
     * @param {string} userId - 用户ID
     * @param {Object} dateRange - 日期范围
     * @returns {Object} 统计信息
     */
    getProgressStats(userId, dateRange = {}) {
        try {
            const progress = this.getUserProgress(userId, dateRange);

            const stats = {
                totalRecords: progress.length,
                totalTimeSpent: 0,
                averageTimeSpent: 0,
                averageSatisfaction: 0,
                byDifficulty: { easy: 0, medium: 0, hard: 0 },
                bySatisfaction: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                byProgressType: { manual: 0, auto: 0, timer: 0 },
                dailyStats: {},
                weeklyStats: {},
                monthlyStats: {},
                tasksWorkedOn: new Set(),
                mostProductiveDay: null,
                longestSession: 0,
                totalSessions: 0
            };

            let totalSatisfaction = 0;
            let satisfactionCount = 0;
            let longestSession = 0;

            progress.forEach(record => {
                // 时间统计
                const timeSpent = record.timeSpent || 0;
                stats.totalTimeSpent += timeSpent;
                stats.totalSessions++;

                if (timeSpent > longestSession) {
                    longestSession = timeSpent;
                }

                // 满意度统计
                if (record.satisfaction) {
                    stats.bySatisfaction[record.satisfaction] =
                        (stats.bySatisfaction[record.satisfaction] || 0) + 1;
                    totalSatisfaction += record.satisfaction;
                    satisfactionCount++;
                }

                // 难度统计
                if (record.difficulty) {
                    stats.byDifficulty[record.difficulty] =
                        (stats.byDifficulty[record.difficulty] || 0) + 1;
                }

                // 进度类型统计
                if (record.progressType) {
                    stats.byProgressType[record.progressType] =
                        (stats.byProgressType[record.progressType] || 0) + 1;
                }

                // 按日期统计
                const date = new Date(record.completedAt);
                const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

                if (!stats.dailyStats[dateKey]) {
                    stats.dailyStats[dateKey] = {
                        timeSpent: 0,
                        sessions: 0,
                        satisfaction: 0,
                        satisfactionCount: 0
                    };
                }

                stats.dailyStats[dateKey].timeSpent += timeSpent;
                stats.dailyStats[dateKey].sessions += 1;
                if (record.satisfaction) {
                    stats.dailyStats[dateKey].satisfaction += record.satisfaction;
                    stats.dailyStats[dateKey].satisfactionCount += 1;
                }

                // 记录涉及的任务
                stats.tasksWorkedOn.add(record.taskId);
            });

            // 计算平均值
            stats.averageTimeSpent = stats.totalSessions > 0 ?
                Math.round((stats.totalTimeSpent / stats.totalSessions) * 10) / 10 : 0;
            stats.averageSatisfaction = satisfactionCount > 0 ?
                Math.round((totalSatisfaction / satisfactionCount) * 10) / 10 : 0;
            stats.longestSession = longestSession;

            // 转换Set为数组
            stats.tasksWorkedOn = Array.from(stats.tasksWorkedOn);

            // 找出最高效的日期
            let maxTime = 0;
            let mostProductiveDay = null;

            Object.entries(stats.dailyStats).forEach(([date, data]) => {
                if (data.timeSpent > maxTime) {
                    maxTime = data.timeSpent;
                    mostProductiveDay = date;
                }
            });

            stats.mostProductiveDay = mostProductiveDay;

            // 生成周统计
            stats.weeklyStats = this.aggregateWeeklyStats(stats.dailyStats);

            // 生成月统计
            stats.monthlyStats = this.aggregateMonthlyStats(stats.dailyStats);

            return stats;
        } catch (error) {
            console.error('获取进度统计失败:', error);
            return {
                totalRecords: 0,
                totalTimeSpent: 0,
                averageTimeSpent: 0,
                averageSatisfaction: 0,
                byDifficulty: { easy: 0, medium: 0, hard: 0 },
                bySatisfaction: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                byProgressType: { manual: 0, auto: 0, timer: 0 },
                dailyStats: {},
                weeklyStats: {},
                monthlyStats: {},
                tasksWorkedOn: [],
                mostProductiveDay: null,
                longestSession: 0,
                totalSessions: 0
            };
        }
    }

    /**
     * 聚合周统计数据
     * @param {Object} dailyStats - 日统计数据
     * @returns {Object} 周统计数据
     */
    aggregateWeeklyStats(dailyStats) {
        const weeklyStats = {};

        Object.entries(dailyStats).forEach(([date, data]) => {
            const weekKey = this.getWeekKey(new Date(date));

            if (!weeklyStats[weekKey]) {
                weeklyStats[weekKey] = {
                    timeSpent: 0,
                    sessions: 0,
                    satisfaction: 0,
                    satisfactionCount: 0,
                    days: 0
                };
            }

            weeklyStats[weekKey].timeSpent += data.timeSpent;
            weeklyStats[weekKey].sessions += data.sessions;
            weeklyStats[weekKey].satisfaction += data.satisfaction;
            weeklyStats[weekKey].satisfactionCount += data.satisfactionCount;
            weeklyStats[weekKey].days += 1;
        });

        // 计算每周平均满意度
        Object.keys(weeklyStats).forEach(week => {
            const stats = weeklyStats[week];
            stats.averageSatisfaction = stats.satisfactionCount > 0 ?
                Math.round((stats.satisfaction / stats.satisfactionCount) * 10) / 10 : 0;
        });

        return weeklyStats;
    }

    /**
     * 聚合月统计数据
     * @param {Object} dailyStats - 日统计数据
     * @returns {Object} 月统计数据
     */
    aggregateMonthlyStats(dailyStats) {
        const monthlyStats = {};

        Object.entries(dailyStats).forEach(([date, data]) => {
            const monthKey = date.substring(0, 7); // YYYY-MM

            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    timeSpent: 0,
                    sessions: 0,
                    satisfaction: 0,
                    satisfactionCount: 0,
                    days: 0
                };
            }

            monthlyStats[monthKey].timeSpent += data.timeSpent;
            monthlyStats[monthKey].sessions += data.sessions;
            monthlyStats[monthKey].satisfaction += data.satisfaction;
            monthlyStats[monthKey].satisfactionCount += data.satisfactionCount;
            monthlyStats[monthKey].days += 1;
        });

        // 计算每月平均满意度
        Object.keys(monthlyStats).forEach(month => {
            const stats = monthlyStats[month];
            stats.averageSatisfaction = stats.satisfactionCount > 0 ?
                Math.round((stats.satisfaction / stats.satisfactionCount) * 10) / 10 : 0;
        });

        return monthlyStats;
    }

    /**
     * 获取周键值
     * @param {Date} date - 日期
     * @returns {string} 周键值（YYYY-WW）
     */
    getWeekKey(date) {
        const year = date.getFullYear();
        const week = Math.floor((date - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        return `${year}-${String(week + 1).padStart(2, '0')}`;
    }

    /**
     * 更新任务的总用时
     * @param {string} taskId - 任务ID
     */
    updateTaskTotalTime(taskId) {
        try {
            const progressRecords = Storage.find(this.storageKey, p => p.taskId === taskId);
            const totalTime = progressRecords.reduce((sum, record) => sum + (record.timeSpent || 0), 0);

            Storage.update(this.taskKey, taskId, {
                actualTime: totalTime
            });
        } catch (error) {
            console.error('更新任务总用时失败:', error);
        }
    }

    /**
     * 获取学习热力图数据
     * @param {string} userId - 用户ID
     * @param {number} days - 天数（默认365天）
     * @returns {Array} 热力图数据
     */
    getHeatmapData(userId, days = 365) {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
            const progress = this.getUserProgress(userId, {
                dateFrom: startDate.toISOString(),
                dateTo: endDate.toISOString()
            });

            const heatmapData = {};
            const dailyTime = {};

            // 按日期聚合学习时间
            progress.forEach(record => {
                const dateKey = record.completedAt.split('T')[0];
                dailyTime[dateKey] = (dailyTime[dateKey] || 0) + (record.timeSpent || 0);
            });

            // 生成连续日期的数据
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0];
                const timeSpent = dailyTime[dateKey] || 0;

                heatmapData[dateKey] = {
                    date: dateKey,
                    timeSpent: timeSpent,
                    level: this.getHeatmapLevel(timeSpent)
                };
            }

            return Object.values(heatmapData);
        } catch (error) {
            console.error('获取热力图数据失败:', error);
            return [];
        }
    }

    /**
     * 获取热力图等级
     * @param {number} timeSpent - 学习时间（分钟）
     * @returns {number} 等级（0-4）
     */
    getHeatmapLevel(timeSpent) {
        if (timeSpent === 0) return 0;
        if (timeSpent < 30) return 1;  // 少于30分钟
        if (timeSpent < 60) return 2;  // 30-60分钟
        if (timeSpent < 120) return 3; // 1-2小时
        return 4; // 超过2小时
    }

    /**
     * 获取目标完成情况
     * @param {string} userId - 用户ID
     * @param {Object} goals - 学习目标
     * @returns {Object} 目标完成情况
     */
    getGoalProgress(userId, goals = {}) {
        try {
            const stats = this.getProgressStats(userId);
            const progress = {};

            // 每日学习时间目标
            if (goals.dailyMinutes) {
                const today = new Date().toISOString().split('T')[0];
                const todayTime = stats.dailyStats[today]?.timeSpent || 0;
                progress.daily = {
                    target: goals.dailyMinutes,
                    actual: todayTime,
                    percentage: Math.round((todayTime / goals.dailyMinutes) * 100),
                    completed: todayTime >= goals.dailyMinutes
                };
            }

            // 每周学习时间目标
            if (goals.weeklyMinutes) {
                const currentWeek = this.getWeekKey(new Date());
                const weekTime = stats.weeklyStats[currentWeek]?.timeSpent || 0;
                progress.weekly = {
                    target: goals.weeklyMinutes,
                    actual: weekTime,
                    percentage: Math.round((weekTime / goals.weeklyMinutes) * 100),
                    completed: weekTime >= goals.weeklyMinutes
                };
            }

            // 每月学习时间目标
            if (goals.monthlyMinutes) {
                const currentMonth = new Date().toISOString().substring(0, 7);
                const monthTime = stats.monthlyStats[currentMonth]?.timeSpent || 0;
                progress.monthly = {
                    target: goals.monthlyMinutes,
                    actual: monthTime,
                    percentage: Math.round((monthTime / goals.monthlyMinutes) * 100),
                    completed: monthTime >= goals.monthlyMinutes
                };
            }

            return progress;
        } catch (error) {
            console.error('获取目标完成情况失败:', error);
            return {};
        }
    }

    /**
     * 导出进度数据
     * @param {string} userId - 用户ID
     * @param {Object} filters - 筛选条件
     * @param {string} format - 导出格式（'json' 或 'csv'）
     * @returns {string} 导出的数据
     */
    exportProgress(userId, filters = {}, format = 'json') {
        try {
            const progress = this.getUserProgress(userId, filters);

            // 获取任务信息
            const progressWithTaskInfo = progress.map(record => {
                const task = Storage.getById(this.taskKey, record.taskId);
                return {
                    ...record,
                    taskTitle: task ? task.title : '未知任务',
                    taskStatus: task ? task.status : '未知'
                };
            });

            if (format === 'csv') {
                // CSV格式导出
                const headers = [
                    'ID', '任务标题', '任务状态', '完成时间', '学习时间(分钟)',
                    '满意度', '难度', '进度类型', '笔记', '标签'
                ];

                const rows = progressWithTaskInfo.map(record => [
                    record.id,
                    `"${record.taskTitle}"`,
                    record.taskStatus,
                    record.completedAt,
                    record.timeSpent || 0,
                    record.satisfaction || 0,
                    record.difficulty || '',
                    record.progressType || '',
                    `"${record.notes}"`,
                    `"${record.tags.join('; ')}"`
                ]);

                return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            } else {
                // JSON格式导出
                return JSON.stringify(progressWithTaskInfo, null, 2);
            }
        } catch (error) {
            console.error('导出进度数据失败:', error);
            return '';
        }
    }

    /**
     * 搜索进度记录
     * @param {string} userId - 用户ID
     * @param {string} query - 搜索查询
     * @param {Array} fields - 搜索字段
     * @returns {Array} 搜索结果
     */
    searchProgress(userId, query, fields = ['notes']) {
        try {
            return Storage.search(this.storageKey, query, fields)
                .filter(progress => progress.userId === userId);
        } catch (error) {
            console.error('搜索进度记录失败:', error);
            return [];
        }
    }
}

// 创建全局进度跟踪器实例
const ProgressTracker = new ProgressTracker();

// 导出进度跟踪器（支持模块化环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProgressTracker };
} else if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
}