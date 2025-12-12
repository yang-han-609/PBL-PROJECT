/**
 * LearnSync - 智能学习任务管理平台
 * 资源管理模块
 * 提供学习资源的增删改查和业务逻辑功能
 */

/**
 * 资源管理类
 */
class ResourceManager {
    constructor() {
        this.storageKey = 'resources';
    }

    /**
     * 创建新资源
     * @param {Object} resourceData - 资源数据
     * @returns {Object} 创建结果
     */
    createResource(resourceData) {
        try {
            // 验证必需字段
            if (!resourceData.name || !resourceData.url || !resourceData.userId) {
                return {
                    success: false,
                    message: '资源名称、URL和用户ID不能为空'
                };
            }

            // 验证URL格式
            if (!this.isValidUrl(resourceData.url)) {
                return {
                    success: false,
                    message: '请输入有效的URL地址'
                };
            }

            // 验证资源类型
            const validTypes = ['article', 'video', 'book', 'link', 'course', 'document', 'tool'];
            if (resourceData.type && !validTypes.includes(resourceData.type)) {
                resourceData.type = 'link';
            }

            // 验证标签
            if (resourceData.tags && !Array.isArray(resourceData.tags)) {
                resourceData.tags = [];
            }

            // 清理和验证标签
            if (resourceData.tags) {
                resourceData.tags = resourceData.tags
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
                    .slice(0, 10); // 最多10个标签
            }

            // 创建资源对象
            const newResource = {
                name: resourceData.name.trim(),
                url: resourceData.url.trim(),
                type: resourceData.type || 'link',
                description: resourceData.description ? resourceData.description.trim() : '',
                tags: resourceData.tags || [],
                userId: resourceData.userId,
                category: resourceData.category || '',
                difficulty: resourceData.difficulty || '', // beginner, intermediate, advanced
                rating: resourceData.rating || 0, // 1-5星评分
                isFavorite: resourceData.isFavorite || false,
                accessCount: 0, // 访问次数
                lastAccessed: null
            };

            const result = Storage.add(this.storageKey, newResource);

            if (result) {
                return {
                    success: true,
                    message: '资源创建成功！',
                    resource: result
                };
            } else {
                return {
                    success: false,
                    message: '资源创建失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('创建资源失败:', error);
            return {
                success: false,
                message: '资源创建失败，系统错误'
            };
        }
    }

    /**
     * 获取用户的所有资源
     * @param {string} userId - 用户ID
     * @param {Object} filters - 筛选条件
     * @returns {Array} 资源列表
     */
    getUserResources(userId, filters = {}) {
        try {
            let resources = Storage.find(this.storageKey, resource => resource.userId === userId);

            // 应用筛选条件
            if (filters.type) {
                resources = resources.filter(resource => resource.type === filters.type);
            }

            if (filters.category) {
                resources = resources.filter(resource => resource.category === filters.category);
            }

            if (filters.difficulty) {
                resources = resources.filter(resource => resource.difficulty === filters.difficulty);
            }

            if (filters.isFavorite !== undefined) {
                resources = resources.filter(resource => resource.isFavorite === filters.isFavorite);
            }

            if (filters.rating) {
                resources = resources.filter(resource => resource.rating >= filters.rating);
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                resources = resources.filter(resource =>
                    resource.name.toLowerCase().includes(searchTerm) ||
                    resource.description.toLowerCase().includes(searchTerm) ||
                    resource.url.toLowerCase().includes(searchTerm) ||
                    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            }

            if (filters.tags && filters.tags.length > 0) {
                resources = resources.filter(resource =>
                    filters.tags.some(tag => resource.tags.includes(tag))
                );
            }

            // 排序
            const sortBy = filters.sortBy || 'createdAt';
            const sortOrder = filters.sortOrder || 'desc';

            resources.sort((a, b) => {
                let compareValue = 0;

                switch (sortBy) {
                    case 'name':
                        compareValue = a.name.localeCompare(b.name);
                        break;
                    case 'type':
                        compareValue = a.type.localeCompare(b.type);
                        break;
                    case 'rating':
                        compareValue = (a.rating || 0) - (b.rating || 0);
                        break;
                    case 'accessCount':
                        compareValue = (a.accessCount || 0) - (b.accessCount || 0);
                        break;
                    case 'lastAccessed':
                        if (!a.lastAccessed) return 1;
                        if (!b.lastAccessed) return -1;
                        compareValue = new Date(a.lastAccessed) - new Date(b.lastAccessed);
                        break;
                    case 'createdAt':
                    default:
                        compareValue = new Date(a.createdAt) - new Date(b.createdAt);
                        break;
                }

                return sortOrder === 'desc' ? -compareValue : compareValue;
            });

            return resources;
        } catch (error) {
            console.error('获取用户资源失败:', error);
            return [];
        }
    }

    /**
     * 获取单个资源
     * @param {string} resourceId - 资源ID
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object|null} 资源对象或null
     */
    getResource(resourceId, userId = null) {
        try {
            const resource = Storage.getById(this.storageKey, resourceId);

            if (!resource) {
                return null;
            }

            // 如果提供了用户ID，验证权限
            if (userId && resource.userId !== userId) {
                return null;
            }

            return resource;
        } catch (error) {
            console.error('获取资源失败:', error);
            return null;
        }
    }

    /**
     * 更新资源
     * @param {string} resourceId - 资源ID
     * @param {Object} updates - 更新数据
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 更新结果
     */
    updateResource(resourceId, updates, userId = null) {
        try {
            const resource = this.getResource(resourceId, userId);
            if (!resource) {
                return {
                    success: false,
                    message: '资源不存在或无权限访问'
                };
            }

            // 验证和清理更新数据
            const allowedUpdates = {};
            const allowedFields = [
                'name', 'url', 'type', 'description', 'tags',
                'category', 'difficulty', 'rating', 'isFavorite'
            ];

            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    allowedUpdates[key] = updates[key];
                }
            });

            // 验证URL（如果要更新）
            if (allowedUpdates.url && !this.isValidUrl(allowedUpdates.url)) {
                return {
                    success: false,
                    message: '请输入有效的URL地址'
                };
            }

            // 验证资源类型
            if (allowedUpdates.type) {
                const validTypes = ['article', 'video', 'book', 'link', 'course', 'document', 'tool'];
                if (!validTypes.includes(allowedUpdates.type)) {
                    return {
                        success: false,
                        message: '无效的资源类型'
                    };
                }
            }

            // 验证难度
            if (allowedUpdates.difficulty) {
                const validDifficulties = ['beginner', 'intermediate', 'advanced'];
                if (!validDifficulties.includes(allowedUpdates.difficulty)) {
                    return {
                        success: false,
                        message: '无效的难度级别'
                    };
                }
            }

            // 验证评分
            if (allowedUpdates.rating !== undefined) {
                if (typeof allowedUpdates.rating !== 'number' ||
                    allowedUpdates.rating < 0 || allowedUpdates.rating > 5) {
                    return {
                        success: false,
                        message: '评分必须在0-5之间'
                    };
                }
            }

            // 验证标签
            if (allowedUpdates.tags) {
                if (!Array.isArray(allowedUpdates.tags)) {
                    allowedUpdates.tags = [];
                } else {
                    allowedUpdates.tags = allowedUpdates.tags
                        .map(tag => tag.trim())
                        .filter(tag => tag.length > 0)
                        .slice(0, 10); // 最多10个标签
                }
            }

            // 清理文本字段
            if (allowedUpdates.name) {
                allowedUpdates.name = allowedUpdates.name.trim();
            }
            if (allowedUpdates.url) {
                allowedUpdates.url = allowedUpdates.url.trim();
            }
            if (allowedUpdates.description) {
                allowedUpdates.description = allowedUpdates.description.trim();
            }

            const result = Storage.update(this.storageKey, resourceId, allowedUpdates);

            if (result) {
                return {
                    success: true,
                    message: '资源更新成功！',
                    resource: result
                };
            } else {
                return {
                    success: false,
                    message: '资源更新失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('更新资源失败:', error);
            return {
                success: false,
                message: '资源更新失败，系统错误'
            };
        }
    }

    /**
     * 删除资源
     * @param {string} resourceId - 资源ID
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 删除结果
     */
    deleteResource(resourceId, userId = null) {
        try {
            const resource = this.getResource(resourceId, userId);
            if (!resource) {
                return {
                    success: false,
                    message: '资源不存在或无权限访问'
                };
            }

            const success = Storage.delete(this.storageKey, resourceId);

            if (success) {
                return {
                    success: true,
                    message: '资源删除成功！'
                };
            } else {
                return {
                    success: false,
                    message: '资源删除失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('删除资源失败:', error);
            return {
                success: false,
                message: '资源删除失败，系统错误'
            };
        }
    }

    /**
     * 批量删除资源
     * @param {Array} resourceIds - 资源ID数组
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 批量删除结果
     */
    deleteResources(resourceIds, userId = null) {
        try {
            let successCount = 0;
            let failCount = 0;

            resourceIds.forEach(resourceId => {
                const result = this.deleteResource(resourceId, userId);
                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            });

            return {
                success: successCount > 0,
                message: `成功删除 ${successCount} 个资源，失败 ${failCount} 个`,
                successCount,
                failCount
            };
        } catch (error) {
            console.error('批量删除资源失败:', error);
            return {
                success: false,
                message: '批量删除失败，系统错误'
            };
        }
    }

    /**
     * 记录资源访问
     * @param {string} resourceId - 资源ID
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 访问记录结果
     */
    recordAccess(resourceId, userId = null) {
        try {
            const resource = this.getResource(resourceId, userId);
            if (!resource) {
                return {
                    success: false,
                    message: '资源不存在或无权限访问'
                };
            }

            const currentAccessCount = resource.accessCount || 0;
            const result = Storage.update(this.storageKey, resourceId, {
                accessCount: currentAccessCount + 1,
                lastAccessed: new Date().toISOString()
            });

            if (result) {
                return {
                    success: true,
                    resource: result,
                    message: '访问记录成功'
                };
            } else {
                return {
                    success: false,
                    message: '访问记录失败'
                };
            }
        } catch (error) {
            console.error('记录访问失败:', error);
            return {
                success: false,
                message: '记录访问失败，系统错误'
            };
        }
    }


    /**
     * 切换收藏状态
     * @param {string} resourceId - 资源ID
     * @param {string} userId - 用户ID（用于权限验证）
     * @returns {Object} 切换结果
     */
    toggleFavorite(resourceId, userId = null) {
        try {
            const resource = this.getResource(resourceId, userId);
            if (!resource) {
                return {
                    success: false,
                    message: '资源不存在或无权限访问'
                };
            }

            const newFavoriteStatus = !resource.isFavorite;
            const result = Storage.update(this.storageKey, resourceId, {
                isFavorite: newFavoriteStatus
            });

            if (result) {
                return {
                    success: true,
                    message: newFavoriteStatus ? '已添加到收藏' : '已取消收藏',
                    resource: result
                };
            } else {
                return {
                    success: false,
                    message: '操作失败，请稍后重试'
                };
            }
        } catch (error) {
            console.error('切换收藏状态失败:', error);
            return {
                success: false,
                message: '操作失败，系统错误'
            };
        }
    }

    /**
     * 获取资源统计信息
     * @param {string} userId - 用户ID
     * @returns {Object} 统计信息
     */
    getResourceStats(userId) {
        try {
            const resources = this.getUserResources(userId);

            const stats = {
                total: resources.length,
                byType: {},
                byCategory: {},
                byDifficulty: {},
                favoriteCount: 0,
                totalAccessCount: 0,
                averageRating: 0,
                recentlyAdded: 0
            };

            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            let totalRating = 0;
            let ratedCount = 0;

            resources.forEach(resource => {
                // 按类型统计
                stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;

                // 按分类统计
                if (resource.category) {
                    stats.byCategory[resource.category] = (stats.byCategory[resource.category] || 0) + 1;
                }

                // 按难度统计
                if (resource.difficulty) {
                    stats.byDifficulty[resource.difficulty] = (stats.byDifficulty[resource.difficulty] || 0) + 1;
                }

                // 收藏数量
                if (resource.isFavorite) {
                    stats.favoriteCount++;
                }

                // 访问统计
                stats.totalAccessCount += resource.accessCount || 0;

                // 评分统计
                if (resource.rating && resource.rating > 0) {
                    totalRating += resource.rating;
                    ratedCount++;
                }

                // 最近添加
                const createdAt = new Date(resource.createdAt);
                if (createdAt >= weekAgo) {
                    stats.recentlyAdded++;
                }
            });

            // 计算平均评分
            stats.averageRating = ratedCount > 0 ? Math.round((totalRating / ratedCount) * 10) / 10 : 0;

            return stats;
        } catch (error) {
            console.error('获取资源统计失败:', error);
            return {
                total: 0,
                byType: {},
                byCategory: {},
                byDifficulty: {},
                favoriteCount: 0,
                totalAccessCount: 0,
                averageRating: 0,
                recentlyAdded: 0
            };
        }
    }

    /**
     * 获取所有标签
     * @param {string} userId - 用户ID
     * @returns {Array} 标签列表
     */
    getAllTags(userId) {
        try {
            const resources = this.getUserResources(userId);
            const tagCounts = {};

            resources.forEach(resource => {
                if (resource.tags && Array.isArray(resource.tags)) {
                    resource.tags.forEach(tag => {
                        if (tag.trim()) {
                            const cleanTag = tag.trim();
                            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
                        }
                    });
                }
            });

            // 转换为数组并按使用频率排序
            return Object.entries(tagCounts)
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count);
        } catch (error) {
            console.error('获取标签失败:', error);
            return [];
        }
    }

    /**
     * 获取推荐资源
     * @param {string} userId - 用户ID
     * @param {number} limit - 推荐数量限制
     * @returns {Array} 推荐资源列表
     */
    getRecommendedResources(userId, limit = 5) {
        try {
            const resources = this.getUserResources(userId);

            // 简单的推荐算法：基于访问次数和评分
            return resources
                .filter(resource => !resource.isFavorite) // 排除已收藏的
                .sort((a, b) => {
                    const scoreA = (a.accessCount || 0) * 0.3 + (a.rating || 0) * 0.7;
                    const scoreB = (b.accessCount || 0) * 0.3 + (b.rating || 0) * 0.7;
                    return scoreB - scoreA;
                })
                .slice(0, limit);
        } catch (error) {
            console.error('获取推荐资源失败:', error);
            return [];
        }
    }

    /**
     * 验证URL格式
     * @param {string} url - URL字符串
     * @returns {boolean} 是否为有效URL
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 搜索资源
     * @param {string} userId - 用户ID
     * @param {string} query - 搜索查询
     * @param {Array} fields - 搜索字段
     * @returns {Array} 搜索结果
     */
    searchResources(userId, query, fields = ['name', 'description', 'tags', 'url']) {
        try {
            return Storage.search(this.storageKey, query, fields)
                .filter(resource => resource.userId === userId);
        } catch (error) {
            console.error('搜索资源失败:', error);
            return [];
        }
    }

    /**
     * 导出资源数据
     * @param {string} userId - 用户ID
     * @param {string} format - 导出格式（'json' 或 'csv'）
     * @returns {string} 导出的数据
     */
    exportResources(userId, format = 'json') {
        try {
            const resources = this.getUserResources(userId);

            if (format === 'csv') {
                // CSV格式导出
                const headers = [
                    'ID', '名称', 'URL', '类型', '描述', '分类',
                    '难度', '评分', '收藏', '访问次数', '标签', '创建时间'
                ];

                const rows = resources.map(resource => [
                    resource.id,
                    `"${resource.name}"`,
                    `"${resource.url}"`,
                    resource.type,
                    `"${resource.description}"`,
                    `"${resource.category}"`,
                    resource.difficulty || '',
                    resource.rating || 0,
                    resource.isFavorite ? '是' : '否',
                    resource.accessCount || 0,
                    `"${resource.tags.join('; ')}"`,
                    resource.createdAt
                ]);

                return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            } else {
                // JSON格式导出
                return JSON.stringify(resources, null, 2);
            }
        } catch (error) {
            console.error('导出资源数据失败:', error);
            return '';
        }
    }

    /**
     * 获取资源类型图标
     * @param {string} type - 资源类型
     * @returns {string} Bootstrap图标类名
     */
    getTypeIcon(type) {
        const iconMap = {
            article: 'bi-file-text',
            video: 'bi-play-circle',
            book: 'bi-book',
            link: 'bi-link-45deg',
            course: 'bi-mortarboard',
            document: 'bi-file-earmark-pdf',
            tool: 'bi-tools'
        };
        return iconMap[type] || 'bi-link-45deg';
    }
}


// 创建全局资源管理器实例
const ResourceManager = new ResourceManager();

// 导出资源管理器（支持模块化环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResourceManager };
} else if (typeof window !== 'undefined') {
    window.ResourceManager = ResourceManager;
}