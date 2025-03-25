// DuoLive 主应用
class DuoLive {
    constructor() {
        this.characters = {
            'AB': { status: 'idle', room: 0 },
            'RP': { status: 'idle', room: 1 },
            'IR': { status: 'idle', room: 2 },
            'GR': { status: 'idle', room: 3 },
            'CG': { status: 'idle', room: 4 }
        };
        
        this.events = [];
        this.notifications = [];
        this.selectedCharacter = null;
        this.currentLanguage = 'zh-CN';
        
        this.init();
    }
    
    init() {
        // 创建房屋布局
        this.createHouseLayout();
        
        // 添加角色
        this.addCharacters();
        
        // 设置实时时钟
        this.setupClock();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 请求通知权限
        this.requestNotificationPermission();
    }
    
    // [房屋布局代码保持不变]

    // [角色代码保持不变]

    // [时钟代码保持不变]
    
    setupEventListeners() {
        // 导入日程按钮
        document.getElementById('import-calendar').addEventListener('click', () => {
            document.getElementById('ics-upload').click();
        });
        
        // 处理文件上传
        document.getElementById('ics-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const icsData = e.target.result;
                    this.importEvents(icsData);
                };
                reader.readAsText(file);
            }
        });
        
        // 语言切换按钮
        document.getElementById('language-toggle').addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // 加载示例按钮
        document.getElementById('load-demo').addEventListener('click', () => {
            this.loadDemoSchedule();
        });
        
        // 处理角色菜单选项
        document.querySelectorAll('#character-menu li').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (this.selectedCharacter) {
                    this.handleCharacterAction(this.selectedCharacter, action);
                }
                this.hideContextMenu();
            });
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.character') && !e.target.closest('#character-menu')) {
                this.hideContextMenu();
            }
        });
    }
    
    toggleLanguage() {
        // 切换语言
        this.currentLanguage = this.currentLanguage === 'zh-CN' ? 'en-US' : 'zh-CN';
        const toggleButton = document.getElementById('language-toggle');
        toggleButton.textContent = this.currentLanguage === 'zh-CN' ? 'English' : '中文';
        
        // 更新所有文本
        this.updateAllTexts();
    }
    
    updateAllTexts() {
        // 更新所有带有 data-lang-key 属性的元素
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.dataset.langKey;
            if (translations[this.currentLanguage][key]) {
                element.textContent = translations[this.currentLanguage][key];
            }
        });
    }
    
    handleCharacterClick(event, characterId) {
        event.stopPropagation();
        
        // 保存当前选中的角色
        this.selectedCharacter = characterId;
        
        // 显示上下文菜单
        const menu = document.getElementById('character-menu');
        menu.style.display = 'block';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
    }
    
    hideContextMenu() {
        document.getElementById('character-menu').style.display = 'none';
        this.selectedCharacter = null;
    }
    
    handleCharacterAction(characterId, action) {
        switch (action) {
            case 'status':
                this.showCharacterStatus(characterId);
                break;
            case 'remind':
                this.remindCharacter(characterId);
                break;
            case 'poke':
                this.pokeCharacter(characterId);
                break;
            case 'chat':
                this.chatWithAI(characterId);
                break;
        }
    }
    
    showCharacterStatus(characterId) {
        const status = this.characters[characterId].status;
        const statusText = translations[this.currentLanguage][status] || status;
        const message = formatString(translations[this.currentLanguage]['my_status'], statusText);
        this.showSpeechBubble(characterId, message);
    }
    
    remindCharacter(characterId) {
        this.showSpeechBubble(characterId, translations[this.currentLanguage]['will_remember']);
        this.addNotification(formatString(translations[this.currentLanguage]['reminded_event'], characterId));
    }
    
    pokeCharacter(characterId) {
        const character = document.querySelector(`.character[data-id="${characterId}"]`);
        
        // 添加抖动动画
        character.style.transform = 'translateX(5px)';
        setTimeout(() => {
            character.style.transform = 'translateX(-5px)';
            setTimeout(() => {
                character.style.transform = 'translateX(0)';
            }, 100);
        }, 100);
        
        this.showSpeechBubble(characterId, translations[this.currentLanguage]['dont_poke']);
    }
    
    chatWithAI(characterId) {
        // 获取当前语言的AI回应
        const responses = aiResponses[this.currentLanguage];
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.showSpeechBubble(characterId, response);
    }
    
    showSpeechBubble(characterId, text) {
        const character = document.querySelector(`.character[data-id="${characterId}"]`);
        const speechBubble = character.querySelector('.speech-bubble');
        
        speechBubble.textContent = text;
        speechBubble.classList.add('active');
        
        // 5秒后隐藏
        setTimeout(() => {
            speechBubble.classList.remove('active');
        }, 5000);
    }
    
    importEvents(icsData) {
        try {
            const events = ICSParser.parse(icsData);
            this.events = this.events.concat(events);
            this.addNotification(formatString(translations[this.currentLanguage]['success_import'], events.length));
            
            // 检查是否有近期的事件
            const now = new Date();
            this.checkEventNotifications(now);
        } catch (error) {
            console.error('导入日程时出错:', error);
            this.addNotification(translations[this.currentLanguage]['import_failed'], 'error');
        }
    }
    
    checkEventNotifications(now) {
        for (const event of this.events) {
            // 如果事件在未来5分钟内，并且还没有提醒过
            const timeDiff = (event.startTime.getTime() - now.getTime()) / (1000 * 60);
            
            if (timeDiff > 0 && timeDiff <= 5 && !event.notified) {
                this.notifyEvent(event);
                event.notified = true;
            }
        }
    }
    
    notifyEvent(event) {
        // 显示通知
        const timeString = event.startTime.toLocaleTimeString();
        this.addNotification(formatString(
            translations[this.currentLanguage]['upcoming_event'], 
            event.userId, 
            event.description, 
            timeString
        ));
        
        // 让相应的角色说话
        this.showSpeechBubble(event.userId, formatString(
            translations[this.currentLanguage]['my_event'], 
            event.description
        ));
        
        // 如果浏览器通知已启用，也发送浏览器通知
        if (this.notificationsEnabled) {
            new Notification(`DuoLive - ${event.userId}`, {
                body: `${event.description} - ${event.startTime.toLocaleTimeString()}`
            });
        }
    }
    
    addNotification(message, type = 'info') {
        const notificationsList = document.getElementById('notifications-list');
        
        const notification = document.createElement('div');
        notification.className = `notification-item ${type}`;
        notification.textContent = message;
        
        notificationsList.prepend(notification);
        
        // 只保留最近的10条通知
        this.notifications.push(message);
        if (this.notifications.length > 10) {
            this.notifications.shift();
            if (notificationsList.children.length > 10) {
                notificationsList.removeChild(notificationsList.lastChild);
            }
        }
    }
    
    requestNotificationPermission() {
        this.notificationsEnabled = false;
        
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.notificationsEnabled = true;
                    this.addNotification(translations[this.currentLanguage]['notifications_enabled']);
                }
            });
        }
    }
    
    // 新增：加载示例日程
    loadDemoSchedule() {
        // 创建一个示例日程，包含当前时间附近的事件
        const now = new Date();
        
        // 创建一些示例事件
        const demoEvents = [
            // 创建从当前时间算起2分钟后的事件
            {
                userId: 'AB',
                description: this.currentLanguage === 'zh-CN' ? '与产品团队会议' : 'Meeting with Product Team',
                startTime: new Date(now.getTime() + 2 * 60 * 1000)
            },
            // 创建从当前时间算起3分钟后的事件
            {
                userId: 'RP',
                description: this.currentLanguage === 'zh-CN' ? '提交项目报告' : 'Submit Project Report',
                startTime: new Date(now.getTime() + 3 * 60 * 1000)
            },
            // 创建从当前时间算起4分钟后的事件
            {
                userId: 'IR',
                description: this.currentLanguage === 'zh-CN' ? '午餐时间' : 'Lunch Break',
                startTime: new Date(now.getTime() + 4 * 60 * 1000)
            },
            // 创建从当前时间算起5分钟后的事件
            {
                userId: 'GR',
                description: this.currentLanguage === 'zh-CN' ? '给客户回电' : 'Call back the client',
                startTime: new Date(now.getTime() + 5 * 60 * 1000)
            }
        ];
        
        // 添加示例事件到事件列表
        this.events = this.events.concat(demoEvents);
        
        // 更新角色状态
        this.characters['AB'].status = 'meeting';
        this.characters['RP'].status = 'working';
        
        // 通知用户
        this.addNotification(translations[this.currentLanguage]['demo_loaded']);
        
        // 立即检查事件通知
        this.checkEventNotifications(now);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.duoLive = new DuoLive();
});
