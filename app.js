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
    
    createHouseLayout() {
        const house = document.querySelector('.house');
        
        // 创建5个房间
        for (let i = 0; i < 5; i++) {
            const room = document.createElement('div');
            room.className = 'room';
            room.dataset.roomId = i;
            
            // 添加家具
            const bed = document.createElement('div');
            bed.className = 'furniture bed';
            room.appendChild(bed);
            
            const desk = document.createElement('div');
            desk.className = 'furniture desk';
            room.appendChild(desk);
            
            house.appendChild(room);
        }
    }
    
    addCharacters() {
        for (const [id, data] of Object.entries(this.characters)) {
            const room = document.querySelector(`.room[data-room-id="${data.room}"]`);
            
            // 创建角色元素
            const character = document.createElement('div');
            character.className = 'character';
            character.dataset.id = id;
            
            const characterInner = document.createElement('div');
            characterInner.className = 'character-inner';
            characterInner.textContent = id;
            character.appendChild(characterInner);
            
            // 添加对话气泡
            const speechBubble = document.createElement('div');
            speechBubble.className = 'speech-bubble';
            character.appendChild(speechBubble);
            
            room.appendChild(character);
            
            // 添加点击事件
            character.addEventListener('click', (e) => this.handleCharacterClick(e, id));
        }
    }
    
    setupClock() {
        const timeElement = document.getElementById('current-time');
        
        // 更新时间和角色状态
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            timeElement.textContent = timeString;
            
            // 更新角色状态基于时间
            this.updateCharacterStates(now);
            
            // 检查事件通知
            this.checkEventNotifications(now);
        };
        
        // 立即更新一次
        updateTime();
        // 每秒更新一次
        setInterval(updateTime, 1000);
    }
    
    updateCharacterStates(now) {
        const hour = now.getHours();
        
        // 晚上10点到早上6点角色睡觉
        for (const [id, data] of Object.entries(this.characters)) {
            const character = document.querySelector(`.character[data-id="${id}"]`);
            if (hour >= 22 || hour < 6) {
                character.classList.add('sleeping');
                this.characters[id].status = 'sleeping';
            } else {
                character.classList.remove('sleeping');
                this.characters[id].status = 'idle';
            }
        }
    }
    
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
        this.showSpeechBubble(characterId, `我现在的状态是: ${status}`);
    }
    
    remindCharacter(characterId) {
        this.showSpeechBubble(characterId, "谢谢提醒，我会记得我的日程的!");
        this.addNotification(`你提醒了 ${characterId} 关于他们的日程安排`);
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
        
        this.showSpeechBubble(characterId, "嘿! 别戳我!");
    }
    
    chatWithAI(characterId) {
        // 简单的AI回应
        const responses = [
            "你好啊！有什么我能帮你的吗？",
            "我现在有点忙，等一下再聊可以吗？",
            "今天天气真好，不是吗？",
            "我在思考人生的意义...",
            "你知道我最喜欢的颜色是什么吗？是蓝色!"
        ];
        
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
            this.addNotification(`成功导入 ${events.length} 个日程事件`);
            
            // 检查是否有近期的事件
            const now = new Date();
            this.checkEventNotifications(now);
        } catch (error) {
            console.error('导入日程时出错:', error);
            this.addNotification('导入日程失败，请检查文件格式', 'error');
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
        this.addNotification(`${event.userId} 的事件：${event.description}，即将在 ${event.startTime.toLocaleTimeString()} 开始`);
        
        // 让相应的角色说话
        this.showSpeechBubble(event.userId, `我的事件 "${event.description}" 即将开始!`);
        
        // 如果浏览器通知已启用，也发送浏览器通知
        if (this.notificationsEnabled) {
            new Notification(`DuoLive - ${event.userId} 的事件提醒`, {
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
                    this.addNotification('通知权限已启用');
                }
            });
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.duoLive = new DuoLive();
});
