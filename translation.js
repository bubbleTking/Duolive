// 语言翻译对象
const translations = {
    'zh-CN': {
        'import_calendar': '导入日程',
        'load_demo': '加载示例',
        'notifications': '通知',
        'check_status': '查看状态',
        'send_reminder': '发送提醒',
        'poke': '戳一戳',
        'chat': '聊天',
        'success_import': '成功导入 {0} 个日程事件',
        'import_failed': '导入日程失败，请检查文件格式',
        'reminded_event': '你提醒了 {0} 关于他们的日程安排',
        'dont_poke': '嘿! 别戳我!',
        'my_status': '我现在的状态是: {0}',
        'will_remember': '谢谢提醒，我会记得我的日程的!',
        'upcoming_event': '{0} 的事件：{1}，即将在 {2} 开始',
        'my_event': '我的事件 "{0}" 即将开始!',
        'notifications_enabled': '通知权限已启用',
        'demo_loaded': '示例日程已加载',
        'idle': '空闲',
        'sleeping': '睡觉',
        'working': '工作',
        'meeting': '开会'
    },
    'en-US': {
        'import_calendar': 'Import Calendar',
        'load_demo': 'Load Demo',
        'notifications': 'Notifications',
        'check_status': 'Check Status',
        'send_reminder': 'Send Reminder',
        'poke': 'Poke',
        'chat': 'Chat',
        'success_import': 'Successfully imported {0} events',
        'import_failed': 'Failed to import calendar, please check file format',
        'reminded_event': 'You reminded {0} about their schedule',
        'dont_poke': "Hey! Don't poke me!",
        'my_status': 'My current status is: {0}',
        'will_remember': "Thanks for the reminder, I'll remember my schedule!",
        'upcoming_event': "{0}'s event: {1}, starts at {2}",
        'my_event': 'My event "{0}" is about to start!',
        'notifications_enabled': 'Notification permissions enabled',
        'demo_loaded': 'Demo schedule loaded',
        'idle': 'idle',
        'sleeping': 'sleeping',
        'working': 'working',
        'meeting': 'in a meeting'
    }
};

// AI响应的翻译
const aiResponses = {
    'zh-CN': [
        "你好啊！有什么我能帮你的吗？",
        "我现在有点忙，等一下再聊可以吗？",
        "今天天气真好，不是吗？",
        "我在思考人生的意义...",
        "你知道我最喜欢的颜色是什么吗？是蓝色!"
    ],
    'en-US': [
        "Hello there! How can I help you today?",
        "I'm a bit busy right now, can we chat later?",
        "Beautiful weather today, isn't it?",
        "I'm contemplating the meaning of life...",
        "Do you know what my favorite color is? It's blue!"
    ]
};

// 格式化字符串的辅助函数
function formatString(str, ...args) {
    return str.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}
