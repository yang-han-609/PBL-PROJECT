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
