// 简单的 ICS 文件解析器
class ICSParser {
    static parse(icsData) {
        const events = [];
        const lines = icsData.split('\n');
        let currentEvent = null;

        for (let line of lines) {
            line = line.trim();

            if (line === 'BEGIN:VEVENT') {
                currentEvent = {
                    userId: '',
                    startTime: null,
                    description: ''
                };
            } else if (line.startsWith('SUMMARY:') && currentEvent) {
                currentEvent.description = line.substring(8);
            } else if (line.startsWith('DTSTART:') && currentEvent) {
                // 解析时间格式：YYYYMMDDTHHMMSSZ
                const dateStr = line.substring(8);
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6) - 1; // 月份是 0-11
                const day = dateStr.substring(6, 8);
                const hour = dateStr.substring(9, 11);
                const minute = dateStr.substring(11, 13);
                currentEvent.startTime = new Date(year, month, day, hour, minute);
            } else if (line.startsWith('DESCRIPTION:UserID:') && currentEvent) {
                currentEvent.userId = line.substring(19);
            } else if (line === 'END:VEVENT' && currentEvent) {
                if (currentEvent.startTime && currentEvent.userId) {
                    events.push(currentEvent);
                }
                currentEvent = null;
            }
        }

        return events;
    }
}
