// 翻译数据
const translations = {
    'zh-CN': {
        'import': '导入日程',
        'demo': '加载示例',
        'notifications': '通知',
        'status': '查看状态',
        'remind': '发送提醒',
        'poke': '戳一戳',
        'chat': '聊天',
        'import_success': '成功导入 {0} 个日程事件',
        'import_fail': '导入失败，请检查文件格式',
        'reminded': '你提醒了 {0} 关于他们的日程',
        'dont_poke': '嘿！别戳我！',
        'status_msg': '我现在在{0}，状态是：{1}',
        'will_remember': '谢谢提醒，我会记得我的日程！',
        'event_notice': '{0} 的事件：{1}，将在 {2} 开始',
        'my_event': '我的事件 "{0}" 即将开始！',
        'notifications_on': '通知权限已启用',
        'demo_loaded': '示例日程已加载',
        'bedroom': '卧室',
        'bathroom': '浴室',
        'living_room': '客厅',
        'kitchen': '厨房',
        'idle': '空闲',
        'sleeping': '睡觉中',
        'working': '工作中',
        'meeting': '开会中',
        'cooking': '做饭中',
        'eating': '用餐中',
        'showering': '淋浴中',
        'going_to': '正在前往{0}',
        'movement': '{0}从{1}移动到{2}'
    },
    'en-US': {
        'import': 'Import Calendar',
        'demo': 'Load Demo',
        'notifications': 'Notifications',
        'status': 'Check Status',
        'remind': 'Send Reminder',
        'poke': 'Poke',
        'chat': 'Chat',
        'import_success': 'Successfully imported {0} events',
        'import_fail': 'Import failed, check file format',
        'reminded': 'You reminded {0} about their schedule',
        'dont_poke': "Hey! Don't poke me!",
        'status_msg': "I'm in the {0}, and I'm {1}",
        'will_remember': "Thanks for the reminder!",
        'event_notice': "{0}'s event: {1}, starts at {2}",
        'my_event': 'My event "{0}" is about to start!',
        'notifications_on': 'Notifications enabled',
        'demo_loaded': 'Demo schedule loaded',
        'bedroom': 'bedroom',
        'bathroom': 'bathroom',
        'living_room': 'living room',
        'kitchen': 'kitchen',
        'idle': 'idle',
        'sleeping': 'sleeping',
        'working': 'working',
        'meeting': 'in a meeting',
        'cooking': 'cooking',
        'eating': 'eating',
        'showering': 'taking a shower',
        'going_to': 'going to the {0}',
        'movement': '{0} moved from {1} to {2}'
    }
};

// AI回复
const aiResponses = {
    'zh-CN': [
        "你好！有什么可以帮你的吗？",
        "我今天有点忙，能等会再聊吗？",
        "唉，室友太吵了，我都睡不好觉...",
        "你觉得我们该给公寓增添点什么家具？",
        "我最近在学习烹饪，想尝尝我做的菜吗？"
    ],
    'en-US': [
        "Hello! How can I help you?",
        "I'm a bit busy today, can we chat later?",
        "Sigh, my roommates are so noisy, I can't sleep well...",
        "What furniture do you think we should add to the apartment?",
        "I've been learning to cook lately, want to try my dishes?"
    ]
};

// 格式化字符串
function format(str, ...args) {
    return str.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

// DuoLive应用
class DuoLive {
    constructor() {
        // 角色数据
        this.characters = {
            'AB': { 
                status: 'idle', 
                room: 'bedroom-1', 
                assignedBedroom: 'bedroom-1',
                x: 0, 
                y: 0 
            },
            'RP': { 
                status: 'idle', 
                room: 'bedroom-2', 
                assignedBedroom: 'bedroom-2',
                x: 0, 
                y: 0 
            },
            'IR': { 
                status: 'idle', 
                room: 'bedroom-3', 
                assignedBedroom: 'bedroom-3',
                x: 0, 
                y: 0 
            },
            'GR': { 
                status: 'idle', 
                room: 'bedroom-4', 
                assignedBedroom: 'bedroom-4',
                x: 0, 
                y: 0 
            },
            'CG': { 
                status: 'idle', 
                room: 'bedroom-5', 
                assignedBedroom: 'bedroom-5',
                x: 0, 
                y: 0 
            }
        };

        // 房间数据
        this.rooms = {
            'bedroom-1': { 
                type: 'bedroom', 
                x: 0, 
                y: 0, 
                width: 150, 
                height: 150,
                occupants: ['AB']
            },
            'bedroom-2': { 
                type: 'bedroom', 
                x: 150, 
                y: 0, 
                width: 150, 
                height: 150,
                occupants: ['RP']
            },
            'bedroom-3': { 
                type: 'bedroom', 
                x: 300, 
                y: 0, 
                width: 150, 
                height: 150,
                occupants: ['IR']
            },
            'bedroom-4': { 
                type: 'bedroom', 
                x: 450, 
                y: 0, 
                width: 150, 
                height: 150,
                occupants: ['GR']
            },
            'bedroom-5': { 
                type: 'bedroom', 
                x: 600, 
                y: 0, 
                width: 150, 
                height: 150,
                occupants: ['CG']
            },
            'bathroom-1': { 
                type: 'bathroom', 
                x: 750, 
                y: 0, 
                width: 150, 
                height: 150,
                occupants: []
            },
            'living-room': { 
                type: 'living-room', 
                x: 0, 
                y: 150, 
                width: 600, 
                height: 350,
                occupants: []
            },
            'kitchen': { 
                type: 'kitchen', 
                x: 600, 
                y: 150, 
                width: 300, 
                height: 350,
                occupants: []
            }
        };

        this.events = [];
        this.selectedCharacter = null;
        this.language = 'zh-CN';
        this.movementQueue = [];  // 角色移动队列

        this.createHouse();
        this.createRoomFurniture();
        this.createCharacters();
        this.setupClock();
        this.setupEvents();
        this.requestNotifications();
    }

    // 创建房屋布局
    createHouse() {
        const house = document.getElementById('house');
        
        // 创建房间
        for (const [roomId, roomData] of Object.entries(this.rooms)) {
            const room = document.createElement('div');
            room.className = `room ${roomData.type}`;
            room.id = roomId;
            room.style.left = `${roomData.x}px`;
            room.style.top = `${roomData.y}px`;
            room.style.width = `${roomData.width}px`;
            room.style.height = `${roomData.height}px`;

            // 添加房间名称
            const roomName = document.createElement('div');
            roomName.className = 'room-name';
            roomName.textContent = translations[this.language][roomData.type];
            room.appendChild(roomName);

            house.appendChild(room);
        }
    }

    // 创建房间家具
    createRoomFurniture() {
        // 卧室家具
        for (let i = 1; i <= 5; i++) {
            const bedroom = document.getElementById(`bedroom-${i}`);
            
            // 床
            const bed = document.createElement('div');
            bed.className = 'furniture bed';
            bed.style.top = '20px';
            bed.style.left = '20px';
            bedroom.appendChild(bed);
            
            // 书桌
            const desk = document.createElement('div');
            desk.className = 'furniture desk';
            desk.style.top = '90px';
            desk.style.left = '80px';
            bedroom.appendChild(desk);
        }
        
        // 浴室家具
        const bathroom = document.getElementById('bathroom-1');
        const sink = document.createElement('div');
        sink.className = 'furniture sink';
        sink.style.top = '50px';
        sink.style.left = '65px';
        bathroom.appendChild(sink);
        
        // 客厅家具
        const livingRoom = document.getElementById('living-room');
        
        // 沙发
        const sofa = document.createElement('div');
        sofa.className = 'furniture sofa';
        sofa.style.top = '100px';
        sofa.style.left = '50px';
        livingRoom.appendChild(sofa);
        
        // 茶几
        const table = document.createElement('div');
        table.className = 'furniture table';
        table.style.top = '100px';
        table.style.left = '200px';
        livingRoom.appendChild(table);
        
        // 厨房家具
        const kitchen = document.getElementById('kitchen');
        
        // 餐桌
        const diningTable = document.createElement('div');
        diningTable.className = 'furniture table';
        diningTable.style.top = '150px';
        diningTable.style.left = '150px';
        kitchen.appendChild(diningTable);
    }

    // 创建角色
    createCharacters() {
        for (const [id, data] of Object.entries(this.characters)) {
            const room = document.getElementById(data.room);
            if (!room) continue;
            
            const character = document.createElement('div');
            character.className = 'character';
            character.dataset.id = id;
            
            // 计算在房间内的位置
            const roomData = this.rooms[data.room];
            data.x = roomData.x + Math.floor(Math.random() * 50) + 30;  // 随机初始位置
            data.y = roomData.y + Math.floor(Math.random() * 50) + 30;
            
            character.style.left = `${data.x}px`;
            character.style.top = `${data.y}px`;
            
            const inner = document.createElement('div');
            inner.className = 'character-inner';
            inner.textContent = id;
            character.appendChild(inner);
            
            // 状态指示器
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'status-indicator';
            character.appendChild(statusIndicator);
            
            // 对话气泡
            const bubble = document.createElement('div');
            bubble.className = 'speech-bubble';
            character.appendChild(bubble);
            
            document.getElementById('house').appendChild(character);
            
            character.addEventListener('click', (e) => {
                this.openCharacterMenu(e, id);
            });
        }

        // 更新状态指示器
        this.updateStatusIndicators();
    }

    // 更新角色状态指示器
    updateStatusIndicators() {
        for (const [id, data] of Object.entries(this.characters)) {
            const character = document.querySelector(`.character[data-id="${id}"]`);
            if (!character) continue;
            
            const indicator = character.querySelector('.status-indicator');
            
            // 根据状态设置emoji
            let emoji = '';
            switch (data.status) {
                case 'sleeping': emoji = '💤'; break;
                case 'working': emoji = '💼'; break;
                case 'meeting': emoji = '👥'; break;
                case 'cooking': emoji = '🍳'; break;
                case 'eating': emoji = '🍽️'; break;
                case 'showering': emoji = '🚿'; break;
                case 'going_to': emoji = '🚶'; break;
            }
            
            indicator.textContent = emoji;
        }
    }

    // 设置时钟和更新
    setupClock() {
        const timeDisplay = document.getElementById('time-display');
        
        const updateTime = () => {
            const now = new Date();
            timeDisplay.textContent = now.toLocaleTimeString();
            
            // 更新角色状态
            this.updateCharactersBasedOnTime(now);
            
            // 处理移动队列
            this.processMovementQueue();
            
            // 检查事件
            this.checkEvents(now);
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    // 根据时间更新角色状态和位置
    updateCharactersBasedOnTime(now) {
        const hour = now.getHours();
        
        for (const [id, data] of Object.entries(this.characters)) {
            // 判断是否应该睡觉
            if ((hour >= 22 || hour < 6) && data.status !== 'sleeping') {
                // 如果不在卧室且未在移动，则移动到卧室
                if (data.room !== data.assignedBedroom && !this.isCharacterMoving(id)) {
                    this.moveCharacterToRoom(id, data.assignedBedroom);
                } else if (data.room === data.assignedBedroom) {
                    // 如果已在卧室但未睡觉，则更新状态为睡觉
                    data.status = 'sleeping';
                    this.updateStatusIndicators();
                }
            } 
            // 白天起床
            else if (hour >= 6 && hour < 22 && data.status === 'sleeping') {
                data.status = 'idle';
                this.updateStatusIndicators();
                
                // 早上起床后去客厅或厨房的概率
                if (Math.random() > 0.5 && !this.isCharacterMoving(id)) {
                    const destination = Math.random() > 0.5 ? 'living-room' : 'kitchen';
                    this.moveCharacterToRoom(id, destination);
                }
            }
            
            // 随机活动 (每分钟有10%概率改变位置)
            if (now.getSeconds() === 0 && Math.random() < 0.1 && !this.isCharacterMoving(id) && data.status !== 'sleeping') {
                this.initiateRandomActivity(id);
            }
        }
    }

    // 随机活动生成
    initiateRandomActivity(characterId) {
        const data = this.characters[characterId];
        const currentRoom = this.rooms[data.room];
        
        // 可能的活动和对应的房间
        const activities = [
            { status: 'idle', room: 'living-room' },
            { status: 'working', room: data.assignedBedroom },
            { status: 'eating', room: 'kitchen' },
            { status: 'showering', room: 'bathroom-1' }
        ];
        
        // 随机选择一个活动
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        // 如果不在目标房间，先移动到那里
        if (data.room !== activity.room) {
            data.status = 'going_to';
            this.updateStatusIndicators();
            this.moveCharacterToRoom(characterId, activity.room, () => {
                // 移动完成后更新状态
                this.characters[characterId].status = activity.status;
                this.updateStatusIndicators();
            });
        } else {
            // 已在目标房间，直接更新状态
            data.status = activity.status;
            this.updateStatusIndicators();
        }
    }

    // 检查角色是否在移动中
    isCharacterMoving(characterId) {
        return this.movementQueue.some(move => move.characterId === characterId);
    }

    // 将角色移动到指定房间
    moveCharacterToRoom(characterId, roomId, callback) {
        const character = document.querySelector(`.character[data-id="${characterId}"]`);
        if (!character) return;
        
        const data = this.characters[characterId];
        const sourceRoom = this.rooms[data.room];
        const targetRoom = this.rooms[roomId];
        
        if (!targetRoom) return;
        
        // 添加到移动队列
        this.movementQueue.push({
            characterId,
            fromRoom: data.room,
            toRoom: roomId,
            callback
        });
        
        // 如果只有一个移动任务，立即处理
        if (this.movementQueue.length === 1) {
            this.processMovementQueue();
        }
        
        // 添加通知
        this.addNotification(format(
            translations[this.language]['movement'],
            characterId,
            translations[this.language][sourceRoom.type],
            translations[this.language][targetRoom.type]
        ));
    }

    // 处理移动队列
    processMovementQueue() {
        if (this.movementQueue.length === 0) return;
        
        const move = this.movementQueue[0];
        const characterId = move.characterId;
        const character = document.querySelector(`.character[data-id="${characterId}"]`);
        if (!character) {
            this.movementQueue.shift();
            this.processMovementQueue();
            return;
        }
        
        const data = this.characters[characterId];
        const targetRoom = this.rooms[move.toRoom];
        
        // 计算目标位置
        const targetX = targetRoom.x + Math.floor(Math.random() * 50) + 30;
        const targetY = targetRoom.y + Math.floor(Math.random() * 50) + 30;
        
        // 设置移动动画
        character.style.transition = 'left 0.5s, top 0.5s';
        character.style.left = `${targetX}px`;
        character.style.top = `${targetY}px`;
        
        // 更新角色数据
        data.x = targetX;
        data.y = targetY;
        
        // 更新房间归属
        const oldRoom = data.room;
        data.room = move.toRoom;
        
        // 更新房间占用列表
        this.rooms[oldRoom].occupants = this.rooms[oldRoom].occupants.filter(id => id !== characterId);
        this.rooms[move.toRoom].occupants.push(characterId);
        
        // 移动完成后的回调
        setTimeout(() => {
            // 移除当前移动任务
            this.movementQueue.shift();
            
            // 调用回调函数
            if (move.callback) move.callback();
            
            // 处理下一个移动任务
            this.processMovementQueue();
        }, 500);  // 500毫秒匹配CSS过渡时间
    }

    // 设置事件监听器
    setupEvents() {
        // 语言切换
        document.getElementById('language-btn').addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // 导入按钮
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('file-upload').click();
        });
        
        // 文件上传
        document.getElementById('file-upload').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
        
        // 示例按钮
        document.getElementById('demo-btn').addEventListener('click', () => {
            this.loadDemoEvents();
        });
        
        // 点击菜单项
        document.querySelectorAll('#character-menu li').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (this.selectedCharacter) {
                    this.handleAction(action, this.selectedCharacter);
                }
                this.closeMenu();
            });
        });
        
        // 点击其他区域关闭菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.character') && !e.target.closest('#character-menu')) {
                this.closeMenu();
            }
        });
    }

    // 切换语言
    toggleLanguage() {
        this.language = this.language === 'zh-CN' ? 'en-US' : 'zh-CN';
        document.getElementById('language-btn').textContent = this.language === 'zh-CN' ? 'English' : '中文';
        this.updateTexts();
    }

    // 更新所有文本
    updateTexts() {
        document.getElementById('import-btn').textContent = translations[this.language]['import'];
        document.getElementById('demo-btn').textContent = translations[this.language]['demo'];
        document.getElementById('notifications-title').textContent = translations[this.language]['notifications'];
        document.getElementById('menu-status').textContent = translations[this.language]['status'];
        document.getElementById('menu-remind').textContent = translations[this.language]['remind'];
        document.getElementById('menu-poke').textContent = translations[this.language]['poke'];
        document.getElementById('menu-chat').textContent = translations[this.language]['chat'];
        
        // 更新房间名
        for (const [roomId, roomData] of Object.entries(this.rooms)) {
            const room = document.getElementById(roomId);
            if (room) {
                const roomName = room.querySelector('.room-name');
                if (roomName) {
                    roomName.textContent = translations[this.language][roomData.type];
                }
            }
        }
    }

    // 打开角色菜单
    openCharacterMenu(event, characterId) {
        event.stopPropagation();
        this.selectedCharacter = characterId;
        
        const menu = document.getElementById('character-menu');
        menu.style.display = 'block';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
    }

    // 关闭菜单
    closeMenu() {
        document.getElementById('character-menu').style.display = 'none';
        this.selectedCharacter = null;
    }

    // 处理菜单动作
    handleAction(action, characterId) {
        switch (action) {
            case 'status':
                this.showStatus(characterId);
                break;
            case 'remind':
                this.sendReminder(characterId);
                break;
            case 'poke':
                this.pokeCharacter(characterId);
                break;
            case 'chat':
                this.chatWithAI(characterId);
                break;
        }
    }

    // 显示角色状态
    showStatus(characterId) {
        const data = this.characters[characterId];
        const roomType = this.rooms[data.room].type;
        const roomName = translations[this.language][roomType];
        const statusText = translations[this.language][data.status];
        const message = format(translations[this.language]['status_msg'], roomName, statusText);
        this.showBubble(characterId, message);
    }

    // 发送提醒
    sendReminder(characterId) {
        this.showBubble(characterId, translations[this.language]['will_remember']);
        this.addNotification(format(translations[this.language]['reminded'], characterId));
    }

    // 戳角色
    pokeCharacter(characterId) {
        const character = document.querySelector(`.character[data-id="${characterId}"]`);
        
        character.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            character.style.transform = 'translateY(0)';
        }, 200);
        
        this.showBubble(characterId, translations[this.language]['dont_poke']);
    }

    // AI聊天
    chatWithAI(characterId) {
        const responses = aiResponses[this.language];
        const message = responses[Math.floor(Math.random() * responses.length)];
        this.showBubble(characterId, message);
    }

    // 显示对话气泡
    showBubble(characterId, text) {
        const character = document.querySelector(`.character[data-id="${characterId}"]`);
        if (!character) return;
        
        const bubble = character.querySelector('.speech-bubble');
        if (!bubble) return;
        
        bubble.textContent = text;
        bubble.classList.add('active');
        
        setTimeout(() => {
            bubble.classList.remove('active');
        }, 5000);
    }

    // 处理文件上传
    handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const events = this.parseICS(e.target.result);
                this.events = this.events.concat(events);
                this.addNotification(format(translations[this.language]['import_success'], events.length));
            } catch (error) {
                console.error("ICS解析错误:", error);
                this.addNotification(translations[this.language]['import_fail']);
            }
        };
        reader.readAsText(file);
    }

    // 简单ICS解析
    parseICS(icsData) {
        const events = [];
        const lines = icsData.split('\n');
        let currentEvent = null;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === 'BEGIN:VEVENT') {
                currentEvent = { userId: '', startTime: null, description: '' };
            } 
            else if (trimmedLine.startsWith('SUMMARY:') && currentEvent) {
                currentEvent.description = trimmedLine.substring(8);
            }
            else if (trimmedLine.startsWith('DTSTART:') && currentEvent) {
                const dateStr = trimmedLine.substring(8);
                try {
                    // 处理常见的日期格式 yyyyMMddTHHmmssZ
                    const year = parseInt(dateStr.substring(0, 4));
                    const month = parseInt(dateStr.substring(4, 6)) - 1;
                    const day = parseInt(dateStr.substring(6, 8));
                    const hour = parseInt(dateStr.substring(9, 11));
                    const minute = parseInt(dateStr.substring(11, 13));
                    currentEvent.startTime = new Date(year, month, day, hour, minute);
                } catch (e) {
                    console.error('日期解析错误', e);
                }
            }
            else if (trimmedLine.startsWith('DESCRIPTION:') && currentEvent) {
                const desc = trimmedLine.substring(12);
                if (desc.startsWith('UserID:')) {
                    currentEvent.userId = desc.substring(7);
                }
            }
            else if (trimmedLine === 'END:VEVENT' && currentEvent) {
                if (currentEvent.startTime && currentEvent.userId) {
                    events.push(currentEvent);
                }
                currentEvent = null;
            }
        }
        
        return events;
    }

    // 检查事件
    checkEvents(now) {
        for (const event of this.events) {
            if (!event.notified) {
                const timeDiff = (event.startTime.getTime() - now.getTime()) / (1000 * 60);
                
                if (timeDiff > 0 && timeDiff <= 5) {
                    this.notifyEvent(event);
                    event.notified = true;
                }
            }
        }
    }

    // 通知事件
    notifyEvent(event) {
        const timeString = event.startTime.toLocaleTimeString();
        this.addNotification(format(
            translations[this.language]['event_notice'],
            event.userId,
            event.description,
            timeString
        ));
        
        this.showBubble(event.userId, format(
            translations[this.language]['my_event'],
            event.description
        ));
        
        // 浏览器通知
        if (this.notificationsEnabled) {
            new Notification(`DuoLive - ${event.userId}`, {
                body: `${event.description} - ${timeString}`
            });
        }

        // 根据事件类型移动角色到适当的房间
        const eventDescription = event.description.toLowerCase();
        let targetRoom = 'living-room';  // 默认去客厅

        if (eventDescription.includes('会议') || eventDescription.includes('meeting')) {
            targetRoom = 'living-room';
            this.characters[event.userId].status = 'meeting';
        } else if (eventDescription.includes('工作') || eventDescription.includes('work')) {
            targetRoom = this.characters[event.userId].assignedBedroom;
            this.characters[event.userId].status = 'working';
        } else if (eventDescription.includes('吃') || eventDescription.includes('eat') || 
                  eventDescription.includes('午餐') || eventDescription.includes('lunch')) {
            targetRoom = 'kitchen';
            this.characters[event.userId].status = 'eating';
        } else if (eventDescription.includes('洗澡') || eventDescription.includes('shower')) {
            targetRoom = 'bathroom-1';
            this.characters[event.userId].status = 'showering';
        }

        // 移动到相应房间
        this.moveCharacterToRoom(event.userId, targetRoom);
    }

    // 添加通知
    addNotification(message) {
        const list = document.getElementById('notifications-list');
        
        const notification = document.createElement('div');
        notification.className = 'notification-item';
        notification.textContent = message;
        
        list.insertBefore(notification, list.firstChild);
        
        // 最多保留10条
        while (list.children.length > 10) {
            list.removeChild(list.lastChild);
        }
    }

    // 请求通知权限
    requestNotifications() {
        this.notificationsEnabled = false;
        
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.notificationsEnabled = true;
                    this.addNotification(translations[this.language]['notifications_on']);
                }
            });
        }
    }

    // 加载示例事件
    loadDemoEvents() {
        const now = new Date();
        
        // 创建示例事件，在未来几分钟内触发
        const demoEvents = [
            {
                userId: 'AB',
                description: this.language === 'zh-CN' ? '产品团队会议' : 'Product Team Meeting',
                startTime: new Date(now.getTime() + 1 * 60 * 1000),
                notified: false
            },
            {
                userId: 'RP',
                description: this.language === 'zh-CN' ? '提交工作报告' : 'Submit Work Report',
                startTime: new Date(now.getTime() + 2 * 60 * 1000),
                notified: false
            },
            {
                userId: 'IR',
                description: this.language === 'zh-CN' ? '午餐时间' : 'Lunch Break',
                startTime: new Date(now.getTime() + 3 * 60 * 1000),
                notified: false
            },
            {
                userId: 'GR',
                description: this.language === 'zh-CN' ? '客户电话会议' : 'Client Call',
                startTime: new Date(now.getTime() + 4 * 60 * 1000),
                notified: false
            },
            {
                userId: 'CG',
                description: this.language === 'zh-CN' ? '洗澡时间' : 'Shower Time',
                startTime: new Date(now.getTime() + 5 * 60 * 1000),
                notified: false
            }
        ];
        
        this.events = this.events.concat(demoEvents);
        this.addNotification(translations[this.language]['demo_loaded']);
    }
}

// 当文档加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DuoLive();
});
