/**
 * LearnSync - 智能学习任务管理平台
 * 图表工具模块
 * 提供Chart.js初始化和绘图逻辑
 */

/**
 * 图表工具类
 */
class ChartUtils {
    constructor() {
        this.charts = new Map(); // 存储已创建的图表实例
        this.defaultColors = {
            primary: '#0d6efd',
            success: '#198754',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#0dcaf0',
            secondary: '#6c757d'
        };

        // 颜色调色板
        this.colorPalette = [
            '#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0',
            '#6610f2', '#d63384', '#fd7e14', '#20c997', '#6f42c1',
            '#495057', '#adb5bd', '#e9ecef', '#dee2e6', '#f8f9fa'
        ];

        // 检查Chart.js是否已加载
        this.checkChartJs();
    }

    /**
     * 检查Chart.js库是否已加载
     */
    checkChartJs() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js库未加载，图表功能将不可用');
            this.chartJsAvailable = false;
        } else {
            this.chartJsAvailable = true;
        }
    }

    /**
     * 创建任务状态饼图
     * @param {string} canvasId - Canvas元素ID
     * @param {Object} stats - 任务统计数据
     * @param {Object} options - 配置选项
     * @returns {Chart|null} 图表实例或null
     */
    createTaskStatusPieChart(canvasId, stats, options = {}) {
        try {
            if (!this.chartJsAvailable) {
                console.error('Chart.js库未加载');
                return null;
            }

            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas元素 #${canvasId} 未找到`);
                return null;
            }

            // 销毁已存在的图表
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const data = {
                labels: ['待办', '进行中', '已完成'],
                datasets: [{
                    data: [
                        stats.byStatus.Todo || 0,
                        stats.byStatus.InProgress || 0,
                        stats.byStatus.Completed || 0
                    ],
                    backgroundColor: [
                        this.defaultColors.secondary,
                        this.defaultColors.info,
                        this.defaultColors.success
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverOffset: 8
                }]
            };

            const config = {
                type: 'pie',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    return data.labels.map((label, i) => ({
                                        text: `${label}: ${data.datasets[0].data[i]}`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    }));
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((context.parsed / total) * 100);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        },
                        title: {
                            display: options.title || false,
                            text: options.title || '任务状态分布',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: 20
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            };

            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('创建任务状态饼图失败:', error);
            return null;
        }
    }

    /**
     * 创建学习时间折线图
     * @param {string} canvasId - Canvas元素ID
     * @param {Array} data - 学习时间数据
     * @param {Object} options - 配置选项
     * @returns {Chart|null} 图表实例或null
     */
    createLearningTimeLineChart(canvasId, data, options = {}) {
        try {
            if (!this.chartJsAvailable) {
                console.error('Chart.js库未加载');
                return null;
            }

            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas元素 #${canvasId} 未找到`);
                return null;
            }

            // 销毁已存在的图表
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const chartData = this.prepareTimeSeriesData(data, options.timeUnit || 'day');

            const config = {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: options.xAxisTitle || this.getTimeAxisTitle(options.timeUnit)
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: options.yAxisTitle || '学习时间（分钟）'
                            },
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + ' 分钟';
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const hours = Math.floor(context.parsed.y / 60);
                                    const minutes = context.parsed.y % 60;
                                    let timeText = '';
                                    if (hours > 0) {
                                        timeText = `${hours}小时${minutes}分钟`;
                                    } else {
                                        timeText = `${minutes}分钟`;
                                    }
                                    return `学习时间: ${timeText}`;
                                }
                            }
                        },
                        title: {
                            display: options.title || false,
                            text: options.title || '学习时间趋势',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: 20
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.4, // 平滑曲线
                            borderWidth: 3,
                            fill: true,
                            backgroundColor: 'rgba(13, 110, 253, 0.1)',
                            borderColor: this.defaultColors.primary
                        },
                        point: {
                            radius: 5,
                            hoverRadius: 8,
                            borderWidth: 2,
                            borderColor: '#ffffff',
                            backgroundColor: this.defaultColors.primary
                        }
                    }
                }
            };

            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('创建学习时间折线图失败:', error);
            return null;
        }
    }

    /**
     * 创建任务优先级条形图
     * @param {string} canvasId - Canvas元素ID
     * @param {Object} stats - 优先级统计数据
     * @param {Object} options - 配置选项
     * @returns {Chart|null} 图表实例或null
     */
    createPriorityBarChart(canvasId, stats, options = {}) {
        try {
            if (!this.chartJsAvailable) {
                console.error('Chart.js库未加载');
                return null;
            }

            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas元素 #${canvasId} 未找到`);
                return null;
            }

            // 销毁已存在的图表
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const data = {
                labels: ['高优先级', '中优先级', '低优先级'],
                datasets: [{
                    label: '任务数量',
                    data: [
                        stats.byPriority.High || 0,
                        stats.byPriority.Medium || 0,
                        stats.byPriority.Low || 0
                    ],
                    backgroundColor: [
                        this.defaultColors.danger,
                        this.defaultColors.warning,
                        this.defaultColors.success
                    ],
                    borderColor: [
                        this.defaultColors.danger,
                        this.defaultColors.warning,
                        this.defaultColors.success
                    ],
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.7
                }]
            };

            const config = {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `任务数量: ${context.parsed.y}`;
                                }
                            }
                        },
                        title: {
                            display: options.title || false,
                            text: options.title || '任务优先级分布',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: 20
                        }
                    }
                }
            };

            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('创建优先级条形图失败:', error);
            return null;
        }
    }
    
        /**
     * 创建学习热力图
     * @param {string} canvasId - Canvas元素ID
     * @param {Array} heatmapData - 热力图数据
     * @param {Object} options - 配置选项
     * @returns {Chart|null} 图表实例或null
     */
    createLearningHeatmap(canvasId, heatmapData, options = {}) {
        try {
            if (!this.chartJsAvailable) {
                console.error('Chart.js库未加载');
                return null;
            }

            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas元素 #${canvasId} 未找到`);
                return null;
            }

            // 销毁已存在的图表
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            // 按周组织数据
            const weeklyData = this.groupDataByWeek(heatmapData);

            const data = {
                labels: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                datasets: Object.keys(weeklyData).map((week, index) => ({
                    label: week,
                    data: weeklyData[week],
                    backgroundColor: function(context) {
                        const value = context.parsed.y;
                        const alpha = value > 0 ? Math.min(value / 120, 1) : 0.05;
                        return `rgba(13, 110, 253, ${alpha})`;
                    },
                    borderColor: this.defaultColors.primary,
                    borderWidth: 1
                }))
            };

            const config = {
                type: 'matrix',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    const weekLabel = context[0].dataset.label;
                                    const dayLabel = context[0].label;
                                    return `${weekLabel} ${dayLabel}`;
                                },
                                label: function(context) {
                                    const minutes = context.parsed.y;
                                    if (minutes === 0) {
                                        return '无学习记录';
                                    }
                                    const hours = Math.floor(minutes / 60);
                                    const mins = minutes % 60;
                                    let timeText = '';
                                    if (hours > 0) {
                                        timeText = `${hours}小时${mins}分钟`;
                                    } else {
                                        timeText = `${mins}分钟`;
                                    }
                                    return `学习时间: ${timeText}`;
                                }
                            }
                        },
                        title: {
                            display: options.title || false,
                            text: options.title || '学习热力图',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: 20
                        }
                    },
                    scales: {
                        x: {
                            type: 'category',
                            labels: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                            ticks: {
                                display: true
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            type: 'category',
                            offset: true,
                            ticks: {
                                display: false
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            };

            // 如果matrix类型不支持，使用scatter图作为备选
            const chartType = 'matrix' in Chart.registry ? 'matrix' : 'scatter';
            if (chartType === 'scatter') {
                return this.createScatterHeatmap(canvasId, heatmapData, options);
            }

            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('创建学习热力图失败:', error);
            // 尝试创建散点图版本
            return this.createScatterHeatmap(canvasId, heatmapData, options);
        }
    }

    /**
     * 创建散点图版本的热力图
     * @param {string} canvasId - Canvas元素ID
     * @param {Array} heatmapData - 热力图数据
     * @param {Object} options - 配置选项
     * @returns {Chart|null} 图表实例或null
     */
    createScatterHeatmap(canvasId, heatmapData, options = {}) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                return null;
            }

            // 转换数据格式
            const scatterData = heatmapData.map((item, index) => ({
                x: index % 7, // 星期几
                y: Math.floor(index / 7), // 第几周
                v: item.timeSpent,
                date: item.date
            }));

            const data = {
                datasets: [{
                    label: '学习时间',
                    data: scatterData,
                    backgroundColor: function(context) {
                        const value = context.raw.v;
                        const alpha = value > 0 ? Math.min(value / 120, 1) : 0.05;
                        return `rgba(13, 110, 253, ${alpha})`;
                    },
                    borderColor: this.defaultColors.primary,
                    borderWidth: 1,
                    pointRadius: 8,
                    pointHoverRadius: 10
                }]
            };

            const config = {
                type: 'scatter',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const minutes = context.raw.v;
                                    const date = context.raw.date;
                                    if (minutes === 0) {
                                        return `${date}: 无学习记录`;
                                    }
                                    const hours = Math.floor(minutes / 60);
                                    const mins = minutes % 60;
                                    let timeText = '';
                                    if (hours > 0) {
                                        timeText = `${hours}小时${mins}分钟`;
                                    } else {
                                        timeText = `${mins}分钟`;
                                    }
                                    return `${date}: ${timeText}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            min: -0.5,
                            max: 6.5,
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                                    return days[value] || '';
                                }
                            }
                        },
                        y: {
                            type: 'linear',
                            min: -0.5,
                            ticks: {
                                display: false
                            }
                        }
                    }
                }
            };

            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('创建散点热力图失败:', error);
            return null;
        }
    }

    /**
     * 创建资源类型饼图
     * @param {string} canvasId - Canvas元素ID
     * @param {Object} stats - 资源统计数据
     * @param {Object} options - 配置选项
     * @returns {Chart|null} 图表实例或null
     */
    createResourceTypePieChart(canvasId, stats, options = {}) {
        try {
            if (!this.chartJsAvailable) {
                console.error('Chart.js库未加载');
                return null;
            }

            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas元素 #${canvasId} 未找到`);
                return null;
            }

            // 销毁已存在的图表
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const typeLabels = {
                article: '文章',
                video: '视频',
                book: '书籍',
                link: '链接',
                course: '课程',
                document: '文档',
                tool: '工具'
            };

            const labels = Object.keys(stats.byType).map(type => typeLabels[type] || type);
            const data = Object.values(stats.byType);
            const colors = Object.keys(stats.byType).map((_, index) =>
                this.colorPalette[index % this.colorPalette.length]
            );

            const chartData = {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverOffset: 8
                }]
            };

            const config = {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((context.parsed / total) * 100);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        },
                        title: {
                            display: options.title || false,
                            text: options.title || '资源类型分布',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: 20
                        }
                    },
                    cutout: '60%',
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            };

            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('创建资源类型饼图失败:', error);
            return null;
        }
    }

    /**
     * 准备时间序列数据
     * @param {Array} data - 原始数据
     * @param {string} timeUnit - 时间单位（'day', 'week', 'month'）
     * @returns {Object} 处理后的数据
     */
    prepareTimeSeriesData(data, timeUnit = 'day') {
        let labels = [];
        let values = [];

        if (timeUnit === 'day') {
            // 按日分组数据
            const dailyData = {};
            data.forEach(item => {
                const date = item.date || item.completedAt;
                const dateKey = date.split('T')[0];
                dailyData[dateKey] = (dailyData[dateKey] || 0) + (item.timeSpent || 0);
            });

            // 排序并生成连续日期
            const sortedDates = Object.keys(dailyData).sort();
            if (sortedDates.length > 0) {
                const startDate = new Date(sortedDates[0]);
                const endDate = new Date(sortedDates[sortedDates.length - 1]);

                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dateKey = d.toISOString().split('T')[0];
                    labels.push(dateKey);
                    values.push(dailyData[dateKey] || 0);
                }
            }
        } else if (timeUnit === 'week') {
            // 按周分组数据
            const weeklyData = {};
            data.forEach(item => {
                const date = new Date(item.date || item.completedAt);
                const weekKey = this.getWeekKey(date);
                weeklyData[weekKey] = (weeklyData[weekKey] || 0) + (item.timeSpent || 0);
            });

            labels = Object.keys(weeklyData).sort();
            values = labels.map(week => weeklyData[week]);
        } else if (timeUnit === 'month') {
            // 按月分组数据
            const monthlyData = {};
            data.forEach(item => {
                const date = new Date(item.date || item.completedAt);
                const monthKey = date.toISOString().substring(0, 7);
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (item.timeSpent || 0);
            });

            labels = Object.keys(monthlyData).sort();
            values = labels.map(month => monthlyData[month]);
        }

        return {
            labels: labels,
            datasets: [{
                label: '学习时间（分钟）',
                data: values,
                fill: false
            }]
        };
    }

    /**
     * 按周组织热力图数据
     * @param {Array} heatmapData - 热力图数据
     * @returns {Object} 按周分组的数据
     */
    groupDataByWeek(heatmapData) {
        const weeklyData = {};
        const currentDate = new Date();
        const currentWeek = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));

        // 生成最近12周的数据
        for (let i = 0; i < 12; i++) {
            const weekNumber = currentWeek - i;
            const weekKey = `第${12 - i}周`;
            weeklyData[weekKey] = new Array(7).fill(0);
        }

        // 填充实际数据
        heatmapData.forEach((item, index) => {
            const date = new Date(item.date);
            const dayOfWeek = date.getDay();
            const weekIndex = Math.floor(index / 7);

            if (weekIndex < 12) {
                const weekKey = `第${weekIndex + 1}周`;
                if (weeklyData[weekKey]) {
                    weeklyData[weekKey][dayOfWeek] = item.timeSpent;
                }
            }
        });

        return weeklyData;
    }

    /**
     * 获取周键值
     * @param {Date} date - 日期
     * @returns {string} 周键值
     */
    getWeekKey(date) {
        const year = date.getFullYear();
        const week = Math.floor((date - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        return `${year}-W${String(week + 1).padStart(2, '0')}`;
    }

    /**
     * 获取时间轴标题
     * @param {string} timeUnit - 时间单位
     * @returns {string} 轴标题
     */
    getTimeAxisTitle(timeUnit) {
        const titles = {
            day: '日期',
            week: '周',
            month: '月份'
        };
        return titles[timeUnit] || '时间';
    }

    /**
     * 销毁指定图表
     * @param {string} canvasId - Canvas元素ID
     */
    destroyChart(canvasId) {
        try {
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
                this.charts.delete(canvasId);
            }
        } catch (error) {
            console.error('销毁图表失败:', error);
        }
    }

    /**
     * 销毁所有图表
     */
    destroyAllCharts() {
        try {
            this.charts.forEach((chart, canvasId) => {
                chart.destroy();
            });
            this.charts.clear();
        } catch (error) {
            console.error('销毁所有图表失败:', error);
        }
    }

    /**
     * 更新图表数据
     * @param {string} canvasId - Canvas元素ID
     * @param {Object} newData - 新数据
     * @returns {boolean} 是否更新成功
     */
    updateChart(canvasId, newData) {
        try {
            if (!this.charts.has(canvasId)) {
                return false;
            }

            const chart = this.charts.get(canvasId);
            chart.data = newData;
            chart.update();
            return true;
        } catch (error) {
            console.error('更新图表数据失败:', error);
            return false;
        }
    }

    /**
     * 导出图表为图片
     * @param {string} canvasId - Canvas元素ID
     * @param {string} filename - 文件名
     * @returns {boolean} 是否导出成功
     */
    exportChartAsImage(canvasId, filename = 'chart.png') {
        try {
            if (!this.charts.has(canvasId)) {
                return false;
            }

            const canvas = document.getElementById(canvasId);
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return true;
        } catch (error) {
            console.error('导出图表失败:', error);
            return false;
        }
    }

    /**
     * 设置图表主题
     * @param {string} theme - 主题名称（'light', 'dark'）
     */
    setChartTheme(theme) {
        try {
            if (theme === 'dark') {
                Chart.defaults.color = '#e9ecef';
                Chart.defaults.borderColor = '#495057';
                Chart.defaults.backgroundColor = '#2d3139';
            } else {
                Chart.defaults.color = '#212529';
                Chart.defaults.borderColor = '#dee2e6';
                Chart.defaults.backgroundColor = '#ffffff';
            }
        } catch (error) {
            console.error('设置图表主题失败:', error);
        }
    }
}

// 创建全局图表工具实例
const ChartUtils = new ChartUtils();

// 导出图表工具（支持模块化环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartUtils };
} else if (typeof window !== 'undefined') {
    window.ChartUtils = ChartUtils;
}

// 监听主题变化，自动更新图表主题
document.addEventListener('DOMContentLoaded', function() {
    // 检查当前主题
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    ChartUtils.setChartTheme(currentTheme);

    // 监听主题切换
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
                ChartUtils.setChartTheme(newTheme);
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});