/**
 * LearnSync - 智能学习任务管理平台
 * LocalStorage 封装类/模块
 * 提供 CRUD 操作和数据持久化功能
 */

/**
 * LocalStorage 封装类
 * 提供通用的数据存储和检索方法
 */
class StorageManager {
    /**
     * 初始化存储管理器
     * @param {string} prefix - 存储键前缀，默认为 'ls_'
     */
    constructor(prefix = 'ls_') {
        this.prefix = prefix;
        this.initializeDefaultData();
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一标识符
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 获取完整的存储键名
     * @param {string} key - 原始键名
     * @returns {string} 带前缀的完整键名
     */
    getFullKey(key) {
        return this.prefix + key;
    }

    /**
     * 获取数据
     * @param {string} key - 数据键
     * @param {*} defaultValue - 默认值（如果数据不存在）
     * @returns {*} 存储的数据或默认值
     */
    get(key, defaultValue = []) {
        try {
            const fullKey = this.getFullKey(key);
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`获取数据失败 (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * 保存数据
     * @param {string} key - 数据键
     * @param {*} data - 要保存的数据
     * @returns {boolean} 是否保存成功
     */
    set(key, data) {
        try {
            const fullKey = this.getFullKey(key);
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`保存数据失败 (${key}):`, error);
            return false;
        }
    }

    /**
     * 添加新记录
     * @param {string} key - 数据键
     * @param {Object} item - 要添加的记录
     * @returns {Object|null} 添加的记录（包含ID）或null（失败）
     */
    add(key, item) {
        try {
            const data = this.get(key);
            const newItem = {
                ...item,
                id: this.generateId(),
                createdAt: new Date().toISOString()
            };
            data.push(newItem);
            this.set(key, data);
            return newItem;
        } catch (error) {
            console.error(`添加记录失败 (${key}):`, error);
            return null;
        }
    }

    /**
     * 根据ID获取记录
     * @param {string} key - 数据键
     * @param {string} id - 记录ID
     * @returns {Object|null} 找到的记录或null
     */
    getById(key, id) {
        try {
            const data = this.get(key);
            return data.find(item => item.id === id) || null;
        } catch (error) {
            console.error(`根据ID获取记录失败 (${key}, ${id}):`, error);
            return null;
        }
    }

    /**
     * 根据条件查找记录
     * @param {string} key - 数据键
     * @param {Function} predicate - 查找条件函数
     * @returns {Array} 符合条件的记录数组
     */
    find(key, predicate) {
        try {
            const data = this.get(key);
            return data.filter(predicate);
        } catch (error) {
            console.error(`查找记录失败 (${key}):`, error);
            return [];
        }
    }

    /**
     * 根据条件查找单个记录
     * @param {string} key - 数据键
     * @param {Function} predicate - 查找条件函数
     * @returns {Object|null} 符合条件的记录或null
     */
    findOne(key, predicate) {
        try {
            const data = this.get(key);
            return data.find(predicate) || null;
        } catch (error) {
            console.error(`查找单个记录失败 (${key}):`, error);
            return null;
        }
    }

    /**
     * 更新记录
     * @param {string} key - 数据键
     * @param {string} id - 记录ID
     * @param {Object} updates - 更新的字段
     * @returns {Object|null} 更新后的记录或null
     */
    update(key, id, updates) {
        try {
            const data = this.get(key);
            const index = data.findIndex(item => item.id === id);

            if (index === -1) {
                console.warn(`记录不存在 (${key}, ${id})`);
                return null;
            }

            const updatedItem = {
                ...data[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            data[index] = updatedItem;
            this.set(key, data);
            return updatedItem;
        } catch (error) {
            console.error(`更新记录失败 (${key}, ${id}):`, error);
            return null;
        }
    }

    /**
     * 删除记录
     * @param {string} key - 数据键
     * @param {string} id - 记录ID
     * @returns {boolean} 是否删除成功
     */
    delete(key, id) {
        try {
            const data = this.get(key);
            const index = data.findIndex(item => item.id === id);

            if (index === -1) {
                console.warn(`记录不存在 (${key}, ${id})`);
                return false;
            }

            data.splice(index, 1);
            this.set(key, data);
            return true;
        } catch (error) {
            console.error(`删除记录失败 (${key}, ${id}):`, error);
            return false;
        }
    }

    /**
     * 批量删除记录
     * @param {string} key - 数据键
     * @param {Function} predicate - 删除条件函数
     * @returns {number} 删除的记录数量
     */
    deleteMany(key, predicate) {
        try {
            const data = this.get(key);
            const originalLength = data.length;
            const filteredData = data.filter(item => !predicate(item));
            const deletedCount = originalLength - filteredData.length;

            if (deletedCount > 0) {
                this.set(key, filteredData);
            }

            return deletedCount;
        } catch (error) {
            console.error(`批量删除记录失败 (${key}):`, error);
            return 0;
        }
    }

    /**
     * 清空指定键的所有数据
     * @param {string} key - 数据键
     * @returns {boolean} 是否清空成功
     */
    clear(key) {
        try {
            const fullKey = this.getFullKey(key);
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error(`清空数据失败 (${key}):`, error);
            return false;
        }
    }

    /**
     * 获取所有存储的键名
     * @returns {Array} 键名数组
     */
    getAllKeys() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key.substring(this.prefix.length));
                }
            }
            return keys;
        } catch (error) {
            console.error('获取所有键名失败:', error);
            return [];
        }
    }

    /**
     * 获取数据统计信息
     * @param {string} key - 数据键
     * @returns {Object} 统计信息
     */
    getStats(key) {
        try {
            const data = this.get(key);
            return {
                total: data.length,
                storageSize: JSON.stringify(data).length,
                lastUpdated: data.length > 0 ?
                    Math.max(...data.map(item => new Date(item.createdAt || item.updatedAt).getTime())) :
                    null
            };
        } catch (error) {
            console.error(`获取统计信息失败 (${key}):`, error);
            return { total: 0, storageSize: 0, lastUpdated: null };
        }
    }

    /**
     * 导出数据为JSON字符串
     * @param {string} key - 数据键
     * @returns {string} JSON格式的数据
     */
    exportData(key) {
        try {
            const data = this.get(key);
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error(`导出数据失败 (${key}):`, error);
            return '[]';
        }
    }

    /**
     * 导入数据
     * @param {string} key - 数据键
     * @param {string} jsonData - JSON格式的数据
     * @param {boolean} merge - 是否合并现有数据（默认为false，即替换）
     * @returns {boolean} 是否导入成功
     */
    importData(key, jsonData, merge = false) {
        try {
            const data = JSON.parse(jsonData);

            if (!Array.isArray(data)) {
                console.error('导入数据格式错误：必须是数组');
                return false;
            }

            if (merge) {
                const existingData = this.get(key);
                const mergedData = [...existingData, ...data];
                this.set(key, mergedData);
            } else {
                this.set(key, data);
            }

            return true;
        } catch (error) {
            console.error(`导入数据失败 (${key}):`, error);
            return false;
        }
    }

    /**
     * 搜索记录
     * @param {string} key - 数据键
     * @param {string} searchTerm - 搜索词
     * @param {Array} fields - 搜索字段（可选，默认搜索所有字符串字段）
     * @returns {Array} 匹配的记录数组
     */
    search(key, searchTerm, fields = null) {
        try {
            const data = this.get(key);
            if (!searchTerm.trim()) return data;

            const term = searchTerm.toLowerCase();
            return data.filter(item => {
                if (fields && fields.length > 0) {
                    return fields.some(field => {
                        const value = item[field];
                        return value &&
                               typeof value === 'string' &&
                               value.toLowerCase().includes(term);
                    });
                } else {
                    // 搜索所有字符串字段
                    return Object.values(item).some(value =>
                        value &&
                        typeof value === 'string' &&
                        value.toLowerCase().includes(term)
                    );
                }
            });
        } catch (error) {
            console.error(`搜索记录失败 (${key}, ${searchTerm}):`, error);
            return [];
        }
    }

    /**
     * 验证数据完整性
     * @param {string} key - 数据键
     * @param {Object} schema - 验证模式（必需字段）
     * @returns {Array} 验证结果
     */
    validateData(key, schema) {
        try {
            const data = this.get(key);
            const errors = [];

            data.forEach((item, index) => {
                if (schema.required) {
                    schema.required.forEach(field => {
                        if (!item.hasOwnProperty(field) || item[field] === null || item[field] === undefined) {
                            errors.push({
                                index,
                                id: item.id,
                                field,
                                message: `缺少必需字段: ${field}`
                            });
                        }
                    });
                }
            });

            return errors;
        } catch (error) {
            console.error(`验证数据失败 (${key}):`, error);
            return [];
        }
    }

    /**
     * 初始化默认数据
     * 在系统首次运行时创建示例数据
     */
    initializeDefaultData() {
        // 只有在没有数据时才初始化
        if (this.get('users').length === 0) {
            this.createDefaultUsers();
            this.createDefaultTasks();
            this.createDefaultResources();
            this.createDefaultProgress();
        } else {
            // 如果已有数据但缺少isActive字段，添加该字段
            this.addIsActiveToExistingUsers();
        }
    }

    /**
     * 为现有用户添加isActive字段
     */
    addIsActiveToExistingUsers() {
        const users = this.get('users');
        let updated = false;

        const updatedUsers = users.map(user => {
            let updatedUser = { ...user };

            if (user.isActive === undefined) {
                updatedUser.isActive = true; // 默认启用所有现有用户
                updated = true;
            }

            return updatedUser;
        });

        if (updated) {
            this.set('users', updatedUsers);
            console.log('已为现有用户添加isActive字段');
        }
    }

    /**
     * 创建默认用户数据
     */
    createDefaultUsers() {
        const defaultUsers = [
            {
                username: 'admin',
                password: '21232f297a57a5a743894a0e4a801fc3', // MD5 of 'admin'
                email: 'admin@learnsync.com',
                role: 'admin',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                username: 'demo',
                password: 'fe01ce2a7fbac8fafaed7c982a04e229', // MD5 of 'demo'
                email: 'demo@learnsync.com',
                role: 'user',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];

        this.set('users', defaultUsers);
        console.log('已创建默认用户: admin 和 demo (已启用)');
    }

    /**
     * 创建默认任务数据
     */
    createDefaultTasks() {
        const demoUser = this.findOne('users', u => u.username === 'demo');
        if (!demoUser) return;

        const defaultTasks = [
            {
                title: '学习 JavaScript 基础',
                description: '完成 JavaScript 基础语法学习，包括变量、函数、对象等概念',
                priority: 'High',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
                userId: demoUser.id,
                status: 'InProgress',
                createdAt: new Date().toISOString()
            },
            {
                title: '阅读《深入理解计算机系统》',
                description: '阅读第1-3章，做好笔记',
                priority: 'Medium',
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14天后
                userId: demoUser.id,
                status: 'Todo',
                createdAt: new Date().toISOString()
            },
            {
                title: '完成算法练习题',
                description: '在 LeetCode 上完成5道算法题',
                priority: 'Medium',
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天后
                userId: demoUser.id,
                status: 'Todo',
                createdAt: new Date().toISOString()
            }
        ];

        this.set('tasks', defaultTasks);
    }

    /**
     * 创建默认资源数据
     */
    createDefaultResources() {
        const demoUser = this.findOne('users', u => u.username === 'demo');
        if (!demoUser) return;

        const defaultResources = [
            {
                name: 'JavaScript MDN 文档',
                type: 'article',
                url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
                tags: ['JavaScript', '文档', '基础'],
                userId: demoUser.id,
                createdAt: new Date().toISOString()
            },
            {
                name: 'Vue.js 官方教程',
                type: 'video',
                url: 'https://cn.vuejs.org/v2/guide/',
                tags: ['Vue', '前端', '框架'],
                userId: demoUser.id,
                createdAt: new Date().toISOString()
            },
            {
                name: '算法导论',
                type: 'book',
                url: 'https://book.douban.com/subject/1883204/',
                tags: ['算法', '计算机科学', '经典'],
                userId: demoUser.id,
                createdAt: new Date().toISOString()
            }
        ];

        this.set('resources', defaultResources);
    }

    /**
     * 创建默认进度数据
     */
    createDefaultProgress() {
        const demoUser = this.findOne('users', u => u.username === 'demo');
        if (!demoUser) return;

        const task1 = this.findOne('tasks', t => t.title === '学习 JavaScript 基础');
        if (!task1) return;

        const defaultProgress = [
            {
                userId: demoUser.id,
                taskId: task1.id,
                completedAt: new Date().toISOString(),
                notes: '完成了变量和函数的学习，需要继续学习对象和数组',
                timeSpent: 120, // 120分钟
                createdAt: new Date().toISOString()
            }
        ];

        this.set('progress', defaultProgress);
    }
}

// 创建全局存储管理器实例
const Storage = new StorageManager();

// 导出存储管理器（支持模块化环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Storage, StorageManager };
} else if (typeof window !== 'undefined') {
    window.Storage = Storage;
    window.StorageManager = StorageManager;
}