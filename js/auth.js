/**
 * LearnSync - 智能学习任务管理平台
 * 用户认证模块
 * 提供注册、登录、登出和状态管理功能
 */

/**
 * 用户认证管理类
 */
class AuthManager {
    constructor() {
        this.sessionKey = 'learnsync_current_user';
        this.storageKey = 'users';
    }

    /**
     * 用户注册
     * @param {string} username - 用户名
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     * @param {string} role - 用户角色（可选，默认为'user'）
     * @returns {Object} 注册结果
     */
    register(username, email, password, role = 'user') {
        try {
            // 验证输入参数
            if (!username || !email || !password) {
                return {
                    success: false,
                    message: '用户名、邮箱和密码不能为空'
                };
            }

            // 验证用户名长度
            if (username.length < 3 || username.length > 20) {
                return {
                    success: false,
                    message: '用户名长度必须在3-20个字符之间'
                };
            }

            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return {
                    success: false,
                    message: '请输入有效的邮箱地址'
                };
            }

            // 验证密码长度
            if (password.length < 6 || password.length > 30) {
                return {
                    success: false,
                    message: '密码长度必须在6-30个字符之间'
                };
            }

            // 检查用户名是否已存在
            const existingUserByUsername = Storage.findOne(this.storageKey,
                user => user.username === username);
            if (existingUserByUsername) {
                return {
                    success: false,
                    message: '用户名已存在，请选择其他用户名'
                };
            }

            // 检查邮箱是否已存在
            const existingUserByEmail = Storage.findOne(this.storageKey,
                user => user.email === email);
            if (existingUserByEmail) {
                return {
                    success: false,
                    message: '该邮箱已被注册，请使用其他邮箱'
                };
            }

            // 对密码进行MD5加密
            const hashedPassword = md5(password);

            // 创建新用户
            const newUser = {
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                role: role,
                avatar: this.generateAvatar(username),
                isActive: true,
                lastLogin: null,
                loginCount: 0
            };

            const result = Storage.add(this.storageKey, newUser);

            if (result) {
                return {
                    success: true,
                    message: '注册成功！',
                    user: this.sanitizeUser(result)
                };
            } else {
                return {
                    success: false,
                    message: '注册失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('注册失败:', error);
            return {
                success: false,
                message: '注册失败，系统错误'
            };
        }
    }

    /**
     * 用户登录
     * @param {string} username - 用户名或邮箱
     * @param {string} password - 密码
     * @param {boolean} rememberMe - 是否记住登录状态
     * @returns {Object} 登录结果
     */
    login(username, password, rememberMe = false) {
        try {
            // 验证输入参数
            if (!username || !password) {
                return {
                    success: false,
                    message: '用户名和密码不能为空'
                };
            }

            // 对密码进行MD5加密
            const hashedPassword = md5(password);

            // 查找用户（支持用户名或邮箱登录）
            const user = Storage.findOne(this.storageKey, u =>
                (u.username === username || u.email === username.toLowerCase()) &&
                u.password === hashedPassword
            );

            if (!user) {
                return {
                    success: false,
                    message: '用户名或密码错误'
                };
            }

            // 检查用户账号是否激活
            if (!user.isActive) {
                return {
                    success: false,
                    message: '账号已被禁用，请联系管理员'
                };
            }

            // 更新用户登录信息
            const updatedUser = {
                lastLogin: new Date().toISOString(),
                loginCount: (user.loginCount || 0) + 1
            };

            Storage.update(this.storageKey, user.id, updatedUser);

            // 创建用户会话
            const sessionData = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };

            // 保存到sessionStorage
            sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));

            // 如果选择记住我，也保存到localStorage（延长有效期）
            if (rememberMe) {
                localStorage.setItem(`${this.sessionKey}_remember`, JSON.stringify(sessionData));
            }

            return {
                success: true,
                message: '登录成功！',
                user: this.sanitizeUser({ ...user, ...updatedUser })
            };
        } catch (error) {
            console.error('登录失败:', error);
            return {
                success: false,
                message: '登录失败，系统错误'
            };
        }
    }

    /**
     * 用户登出
     * @returns {boolean} 是否登出成功
     */
    logout() {
        try {
            // 清除sessionStorage
            sessionStorage.removeItem(this.sessionKey);

            // 清除localStorage的记住我数据
            localStorage.removeItem(`${this.sessionKey}_remember`);

            // 清除其他可能的用户相关缓存
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('learnsync_temp_')) {
                    sessionStorage.removeItem(key);
                }
            });

            return true;
        } catch (error) {
            console.error('登出失败:', error);
            return false;
        }
    }

    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn() {
        try {
            // 首先检查sessionStorage
            let sessionData = sessionStorage.getItem(this.sessionKey);

            // 如果sessionStorage中没有，检查localStorage的记住我数据
            if (!sessionData) {
                sessionData = localStorage.getItem(`${this.sessionKey}_remember`);
                if (sessionData) {
                    // 恢复到sessionStorage
                    sessionStorage.setItem(this.sessionKey, sessionData);
                }
            }

            if (!sessionData) {
                return false;
            }

            const user = JSON.parse(sessionData);

            // 检查会话是否过期（24小时）
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            if (hoursDiff > 24 && !user.rememberMe) {
                this.logout();
                return false;
            }

            // 验证用户是否仍然存在且活跃
            const currentUser = Storage.getById(this.storageKey, user.id);
            if (!currentUser || !currentUser.isActive) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('检查登录状态失败:', error);
            this.logout();
            return false;
        }
    }

    /**
     * 获取当前登录用户信息
     * @returns {Object|null} 当前用户信息或null
     */
    getCurrentUser() {
        try {
            if (!this.isLoggedIn()) {
                return null;
            }

            const sessionData = sessionStorage.getItem(this.sessionKey) ||
                               localStorage.getItem(`${this.sessionKey}_remember`);

            if (!sessionData) {
                return null;
            }

            return JSON.parse(sessionData);
        } catch (error) {
            console.error('获取当前用户失败:', error);
            return null;
        }
    }

    /**
     * 获取当前用户的完整信息
     * @returns {Object|null} 完整用户信息或null
     */
    getCurrentUserFull() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return null;
            }

            return Storage.getById(this.storageKey, currentUser.id);
        } catch (error) {
            console.error('获取完整用户信息失败:', error);
            return null;
        }
    }

    /**
     * 检查当前用户是否有指定权限
     * @param {string} role - 需要的角色
     * @returns {boolean} 是否有权限
     */
    hasRole(role) {
        try {
            const currentUser = this.getCurrentUser();
            return currentUser && currentUser.role === role;
        } catch (error) {
            console.error('检查角色权限失败:', error);
            return false;
        }
    }

    /**
     * 检查当前用户是否为管理员
     * @returns {boolean} 是否为管理员
     */
    isAdmin() {
        return this.hasRole('admin');
    }

    /**
     * 检查当前用户是否为普通用户
     * @returns {boolean} 是否为普通用户
     */
    isUser() {
        return this.hasRole('user');
    }

    /**
     * 修改密码
     * @param {string} currentPassword - 当前密码
     * @param {string} newPassword - 新密码
     * @returns {Object} 修改结果
     */
    changePassword(currentPassword, newPassword) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: '用户未登录'
                };
            }

            // 获取用户完整信息
            const user = Storage.getById(this.storageKey, currentUser.id);
            if (!user) {
                return {
                    success: false,
                    message: '用户不存在'
                };
            }

            // 验证当前密码
            const currentHashedPassword = md5(currentPassword);
            if (user.password !== currentHashedPassword) {
                return {
                    success: false,
                    message: '当前密码错误'
                };
            }

            // 验证新密码
            if (newPassword.length < 6 || newPassword.length > 30) {
                return {
                    success: false,
                    message: '新密码长度必须在6-30个字符之间'
                };
            }

            // 更新密码
            const newPasswordHash = md5(newPassword);
            const result = Storage.update(this.storageKey, user.id, {
                password: newPasswordHash,
                passwordChangedAt: new Date().toISOString()
            });

            if (result) {
                return {
                    success: true,
                    message: '密码修改成功！'
                };
            } else {
                return {
                    success: false,
                    message: '密码修改失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('修改密码失败:', error);
            return {
                success: false,
                message: '密码修改失败，系统错误'
            };
        }
    }

    /**
     * 更新用户资料
     * @param {Object} updates - 要更新的字段
     * @returns {Object} 更新结果
     */
    updateProfile(updates) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: '用户未登录'
                };
            }

            // 验证邮箱格式（如果要更新邮箱）
            if (updates.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(updates.email)) {
                    return {
                        success: false,
                        message: '请输入有效的邮箱地址'
                    };
                }

                // 检查邮箱是否已被其他用户使用
                const existingUser = Storage.findOne(this.storageKey,
                    user => user.email === updates.email.toLowerCase() && user.id !== currentUser.id);
                if (existingUser) {
                    return {
                        success: false,
                        message: '该邮箱已被其他用户使用'
                    };
                }
            }

            // 清理不允许更新的字段
            const allowedUpdates = {};
            const allowedFields = ['email', 'avatar'];

            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    allowedUpdates[key] = updates[key];
                }
            });

            if (Object.keys(allowedUpdates).length === 0) {
                return {
                    success: false,
                    message: '没有可更新的字段'
                };
            }

            // 更新用户信息
            const result = Storage.update(this.storageKey, currentUser.id, {
                ...allowedUpdates,
                updatedAt: new Date().toISOString()
            });

            if (result) {
                // 更新会话信息
                const updatedUser = { ...currentUser, ...allowedUpdates };
                sessionStorage.setItem(this.sessionKey, JSON.stringify(updatedUser));

                return {
                    success: true,
                    message: '资料更新成功！',
                    user: this.sanitizeUser(result)
                };
            } else {
                return {
                    success: false,
                    message: '资料更新失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('更新资料失败:', error);
            return {
                success: false,
                message: '资料更新失败，系统错误'
            };
        }
    }

    /**
     * 生成用户头像URL
     * @param {string} username - 用户名
     * @returns {string} 头像URL
     */
    generateAvatar(username) {
        // 使用用户名的MD5值生成头像
        const hash = md5(username);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${hash.substring(0, 6)}&color=fff&size=128`;
    }

    /**
     * 清理用户敏感信息
     * @param {Object} user - 用户对象
     * @returns {Object} 清理后的用户对象
     */
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    /**
     * 获取所有用户（仅管理员可用）
     * @returns {Array} 用户列表
     */
    getAllUsers() {
        try {
            if (!this.isAdmin()) {
                return [];
            }

            const users = Storage.get(this.storageKey);
            return users.map(user => this.sanitizeUser(user));
        } catch (error) {
            console.error('获取用户列表失败:', error);
            return [];
        }
    }

    /**
     * 禁用/启用用户（仅管理员可用）
     * @param {string} userId - 用户ID
     * @param {boolean} isActive - 是否激活
     * @returns {Object} 操作结果
     */
    setUserStatus(userId, isActive) {
        try {
            if (!this.isAdmin()) {
                return {
                    success: false,
                    message: '权限不足'
                };
            }

            const currentUser = this.getCurrentUser();
            if (userId === currentUser.id) {
                return {
                    success: false,
                    message: '不能修改自己的状态'
                };
            }

            const result = Storage.update(this.storageKey, userId, { isActive });

            if (result) {
                return {
                    success: true,
                    message: `用户已${isActive ? '启用' : '禁用'}`
                };
            } else {
                return {
                    success: false,
                    message: '操作失败，用户不存在'
                };
            }
        } catch (error) {
            console.error('设置用户状态失败:', error);
            return {
                success: false,
                message: '操作失败，系统错误'
            };
        }
    }

    /**
     * 修改用户角色（仅管理员可用）
     * @param {string} userId - 用户ID
     * @param {string} role - 新角色
     * @returns {Object} 操作结果
     */
    setUserRole(userId, role) {
        try {
            if (!this.isAdmin()) {
                return {
                    success: false,
                    message: '权限不足'
                };
            }

            const currentUser = this.getCurrentUser();
            if (userId === currentUser.id) {
                return {
                    success: false,
                    message: '不能修改自己的角色'
                };
            }

            if (!['admin', 'user'].includes(role)) {
                return {
                    success: false,
                    message: '无效的角色'
                };
            }

            const result = Storage.update(this.storageKey, userId, { role });

            if (result) {
                return {
                    success: true,
                    message: '角色修改成功'
                };
            } else {
                return {
                    success: false,
                    message: '角色修改失败，用户不存在'
                };
            }
        } catch (error) {
            console.error('修改用户角色失败:', error);
            return {
                success: false,
                message: '角色修改失败，系统错误'
            };
        }
    }
}

// 创建全局认证管理器实例
const Auth = new AuthManager();

// 导出认证管理器（支持模块化环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Auth, AuthManager };
} else if (typeof window !== 'undefined') {
    window.Auth = Auth;
    window.AuthManager = AuthManager;
}

// 页面加载时自动检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    // 如果需要登录的页面，检查用户是否已登录
    const protectedPages = [
        'user/dashboard.html',
        'user/tasks.html',
        'user/resources.html',
        'user/progress.html',
        'admin/index.html',
        'admin/users.html',
        'admin/stats.html'
    ];

    const currentPage = window.location.pathname;
    const isProtectedPage = protectedPages.some(page => currentPage.endsWith(page));

    if (isProtectedPage && !Auth.isLoggedIn()) {
        // 重定向到登录页面
        window.location.href = '../index.html';
    }
});