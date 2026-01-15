// Countdown.js
Component({
  properties: {
    endDate: {
      type: String,
      value: ''
    },
    format: {
      type: String,
      value: 'DD天HH时mm分ss秒'
    }
  },

  data: {
    timeLeft: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    },
    formattedTime: ''
  },

  lifetimes: {
    attached() {
      // 组件挂载时开始倒计时
      if (this.properties.endDate) {
        this.startCountdown();
      }
    },
    detached() {
      // 组件卸载时清除定时器
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  },

  observers: {
    // 监听结束时间变化
    endDate(newVal) {
      if (newVal) {
        this.startCountdown();
      }
    }
  },

  methods: {
    // 开始倒计时
    startCountdown() {
      // 清除之前的定时器
      if (this.timer) {
        clearInterval(this.timer);
      }

      // 立即执行一次倒计时
      this.updateCountdown();
      
      // 设置定时器，每秒更新一次
      this.timer = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    },

    // 更新倒计时
    updateCountdown() {
      const endTime = new Date(this.properties.endDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, endTime - now);

      // 计算剩余时间
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const timeLeft = { days, hours, minutes, seconds };
      const formattedTime = this.formatTime(timeLeft);

      this.setData({
        timeLeft,
        formattedTime
      });

      // 倒计时结束时触发事件
      if (diff === 0) {
        this.triggerEvent('countdownend');
        if (this.timer) {
          clearInterval(this.timer);
        }
      }
    },

    // 格式化时间
    formatTime(timeLeft) {
      let format = this.properties.format;
      
      format = format.replace('DD', String(timeLeft.days).padStart(2, '0'));
      format = format.replace('HH', String(timeLeft.hours).padStart(2, '0'));
      format = format.replace('mm', String(timeLeft.minutes).padStart(2, '0'));
      format = format.replace('ss', String(timeLeft.seconds).padStart(2, '0'));
      
      return format;
    }
  }
});