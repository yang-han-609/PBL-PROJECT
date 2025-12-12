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
