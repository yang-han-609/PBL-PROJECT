/**
 * LearnSync - 智能学习任务管理平台
 * 任务管理模块
 * 提供任务的增删改查和业务逻辑功能
 */

/**
 * 任务管理类
 */
class TaskManager {
    constructor() {
        this.storageKey = 'tasks';
        this.progressKey = 'progress';
    }

    /**
     * 创建新任务
     * @param {Object} taskData - 任务数据
     * @returns {Object} 创建结果
     */
    createTask(taskData) {
        try {
            // 验证必需字段
            if (!taskData.title || !taskData.userId) {
                return {
                    success: false,
                    message: '任务标题和用户ID不能为空'
                };
            }

            // 验证优先级
            const validPriorities = ['High', 'Medium', 'Low'];
            if (taskData.priority && !validPriorities.includes(taskData.priority)) {
                taskData.priority = 'Medium';
            }

            // 验证状态
            const validStatuses = ['Todo', 'InProgress', 'Completed'];
            if (taskData.status && !validStatuses.includes(taskData.status)) {
                taskData.status = 'Todo';
            }

            // 验证截止日期
            if (taskData.deadline) {
                const deadline = new Date(taskData.deadline);
                if (isNaN(deadline.getTime())) {
                    taskData.deadline = null;
                } else {
                    taskData.deadline = deadline.toISOString();
                }
            }

            // 创建任务对象
            const newTask = {
                title: taskData.title.trim(),
                description: taskData.description ? taskData.description.trim() : '',
                priority: taskData.priority || 'Medium',
                deadline: taskData.deadline,
                userId: taskData.userId,
                status: taskData.status || 'Todo',
                tags: Array.isArray(taskData.tags) ? taskData.tags : [],
                estimatedTime: taskData.estimatedTime || null, // 预估时间（分钟）
                actualTime: 0, // 实际用时（分钟）
                completedAt: null
            };

            const result = Storage.add(this.storageKey, newTask);

            if (result) {
                return {
                    success: true,
                    message: '任务创建成功！',
                    task: result
                };
            } else {
                return {
                    success: false,
                    message: '任务创建失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('创建任务失败:', error);
            return {
                success: false,
                message: '任务创建失败，系统错误'
            };
        }
    }

    /**
     * 获取用户的所有任务
     * @param {string} userId - 用户ID
     * @param {Object} filters - 筛选条件
     * @returns {Array} 任务列表
     */
    getUserTasks(userId, filters = {}) {
        try {
            let tasks = Storage.find(this.storageKey, task => task.userId === userId);

            // 应用筛选条件
            if (filters.status) {
                tasks = tasks.filter(task => task.status === filters.status);
            }

            if (filters.priority) {
                tasks = tasks.filter(task => task.priority === filters.priority);
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                tasks = tasks.filter(task =>
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm)
                );
            }

            if (filters.tags && filters.tags.length > 0) {
                tasks = tasks.filter(task =>
                    filters.tags.some(tag => task.tags.includes(tag))
                );
            }

            if (filters.deadline) {
                const now = new Date();
                tasks = tasks.filter(task => {
                    if (!task.deadline) return false;
                    const deadline = new Date(task.deadline);
                    const daysDiff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

                    switch (filters.deadline) {
                        case 'overdue': return daysDiff < 0;
                        case 'today': return daysDiff === 0;
                        case 'week': return daysDiff > 0 && daysDiff <= 7;
                        case 'month': return daysDiff > 0 && daysDiff <= 30;
                        default: return true;
                    }
                });
            }

            // 排序
            const sortBy = filters.sortBy || 'createdAt';
            const sortOrder = filters.sortOrder || 'desc';

            tasks.sort((a, b) => {
                let compareValue = 0;

                switch (sortBy) {
                    case 'deadline':
                        if (!a.deadline) return 1;
                        if (!b.deadline) return -1;
                        compareValue = new Date(a.deadline) - new Date(b.deadline);
                        break;
                    case 'priority':
                        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                        compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
                        break;
                    case 'status':
                        const statusOrder = { Todo: 1, InProgress: 2, Completed: 3 };
                        compareValue = statusOrder[a.status] - statusOrder[b.status];
                        break;
                    case 'title':
                        compareValue = a.title.localeCompare(b.title);
                        break;
                    case 'createdAt':
                    default:
                        compareValue = new Date(a.createdAt) - new Date(b.createdAt);
                        break;
                }

                return sortOrder === 'desc' ? -compareValue : compareValue;
            });

            return tasks;
        } catch (error) {
            console.error('获取用户任务失败:', error);
            return [];
        }
    }

    /**
     * 获取单个任务
     * @param {string} taskId - 任务ID
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object|null} 任务对象或null
     */
    getTask(taskId, userId = null) {
        try {
            const task = Storage.getById(this.storageKey, taskId);

            if (!task) {
                return null;
            }

            // 如果提供了用户ID，验证权限
            if (userId && task.userId !== userId) {
                return null;
            }

            return task;
        } catch (error) {
            console.error('获取任务失败:', error);
            return null;
        }
    }

    /**
     * 更新任务
     * @param {string} taskId - 任务ID
     * @param {Object} updates - 更新数据
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 更新结果
     */
    updateTask(taskId, updates, userId = null) {
        try {
            const task = this.getTask(taskId, userId);
            if (!task) {
                return {
                    success: false,
                    message: '任务不存在或无权限访问'
                };
            }

            // 验证和清理更新数据
            const allowedUpdates = {};
            const allowedFields = [
                'title', 'description', 'priority', 'deadline',
                'status', 'tags', 'estimatedTime'
            ];

            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    allowedUpdates[key] = updates[key];
                }
            });

            // 验证优先级
            if (allowedUpdates.priority) {
                const validPriorities = ['High', 'Medium', 'Low'];
                if (!validPriorities.includes(allowedUpdates.priority)) {
                    return {
                        success: false,
                        message: '无效的优先级'
                    };
                }
            }

            // 验证状态
            if (allowedUpdates.status) {
                const validStatuses = ['Todo', 'InProgress', 'Completed'];
                if (!validStatuses.includes(allowedUpdates.status)) {
                    return {
                        success: false,
                        message: '无效的状态'
                    };
                }

                // 如果状态改为完成，设置完成时间
                if (allowedUpdates.status === 'Completed' && task.status !== 'Completed') {
                    allowedUpdates.completedAt = new Date().toISOString();

                    // 创建进度记录
                    this.createProgressRecord({
                        userId: task.userId,
                        taskId: taskId,
                        completedAt: allowedUpdates.completedAt,
                        notes: '任务完成',
                        timeSpent: task.actualTime || 0
                    });
                }

                // 如果状态从完成改为其他状态，清除完成时间
                if (allowedUpdates.status !== 'Completed' && task.status === 'Completed') {
                    allowedUpdates.completedAt = null;
                }
            }

            // 验证截止日期
            if (allowedUpdates.deadline) {
                const deadline = new Date(allowedUpdates.deadline);
                if (isNaN(deadline.getTime())) {
                    return {
                        success: false,
                        message: '无效的截止日期'
                    };
                }
                allowedUpdates.deadline = deadline.toISOString();
            }

            // 验证标签
            if (allowedUpdates.tags && !Array.isArray(allowedUpdates.tags)) {
                allowedUpdates.tags = [];
            }

            // 清理标题和描述
            if (allowedUpdates.title) {
                allowedUpdates.title = allowedUpdates.title.trim();
            }
            if (allowedUpdates.description) {
                allowedUpdates.description = allowedUpdates.description.trim();
            }

            const result = Storage.update(this.storageKey, taskId, allowedUpdates);

            if (result) {
                return {
                    success: true,
                    message: '任务更新成功！',
                    task: result
                };
            } else {
                return {
                    success: false,
                    message: '任务更新失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('更新任务失败:', error);
            return {
                success: false,
                message: '任务更新失败，系统错误'
            };
        }
    }

    /**
     * 删除任务
     * @param {string} taskId - 任务ID
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 删除结果
     */
    deleteTask(taskId, userId = null) {
        try {
            const task = this.getTask(taskId, userId);
            if (!task) {
                return {
                    success: false,
                    message: '任务不存在或无权限访问'
                };
            }

            const success = Storage.delete(this.storageKey, taskId);

            if (success) {
                // 删除相关的进度记录
                Storage.deleteMany(this.progressKey, progress => progress.taskId === taskId);

                return {
                    success: true,
                    message: '任务删除成功！'
                };
            } else {
                return {
                    success: false,
                    message: '任务删除失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('删除任务失败:', error);
            return {
                success: false,
                message: '任务删除失败，系统错误'
            };
        }
    }

    /**
     * 批量删除任务
     * @param {Array} taskIds - 任务ID数组
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 批量删除结果
     */
    deleteTasks(taskIds, userId = null) {
        try {
            let successCount = 0;
            let failCount = 0;

            taskIds.forEach(taskId => {
                const result = this.deleteTask(taskId, userId);
                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            });

            return {
                success: successCount > 0,
                message: `成功删除 ${successCount} 个任务，失败 ${failCount} 个`,
                successCount,
                failCount
            };
        } catch (error) {
            console.error('批量删除任务失败:', error);
            return {
                success: false,
                message: '批量删除失败，系统错误'
            };
        }
    }
