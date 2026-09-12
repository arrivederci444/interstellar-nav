<script setup>
defineProps({
  launching: { type: Boolean, default: false },
})

const emit = defineEmits(['action', 'launch', 'navigate'])
</script>

<template>
  <footer class="bottom-bar">
    <div class="quick">
      <button class="quick-item" @click="emit('action', '未来天气')">
        <span class="q-ico">🌀</span>
        <span class="q-txt">未来天气</span>
      </button>
      <button class="quick-item" @click="emit('action', '路线分享')">
        <span class="q-ico">📤</span>
        <span class="q-txt">路线分享</span>
      </button>
      <button class="quick-item" @click="emit('action', '更多')">
        <span class="q-ico">⋯</span>
        <span class="q-txt">更多</span>
      </button>
    </div>

    <div class="cta">
      <button class="btn launch" :disabled="launching" @click="emit('launch')">
        <span class="btn-ico">🚀</span>
        <span>{{ launching ? '发射中…' : '发射飞船' }}</span>
      </button>
      <button class="btn navigate" @click="emit('navigate')">
        <span class="btn-ico">🧭</span>
        <span>开始导航</span>
      </button>
    </div>
  </footer>
</template>

<style scoped>
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 4px 4px;
}

.quick {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: 50px;
  padding: 4px 0;
  border-radius: 12px;
  transition: background 0.15s ease, transform 0.15s ease;
}

.quick-item:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.94);
}

.q-ico {
  font-size: 20px;
  line-height: 1;
}

.q-txt {
  font-size: 11px;
  color: #4a5568;
}

.cta {
  display: flex;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 52px;
  padding: 0 13px;
  border-radius: 14px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
  transition: transform 0.15s ease, filter 0.2s ease;
}

.btn:active {
  transform: scale(0.95);
}

.btn:disabled {
  filter: grayscale(0.35) brightness(0.95);
  cursor: default;
}

.btn-ico {
  font-size: 17px;
}

.launch {
  background: linear-gradient(135deg, #37b6ff, #1677ff);
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.35);
}

.navigate {
  background: linear-gradient(135deg, #3b7bff, #1d4ed8);
  box-shadow: 0 8px 20px rgba(29, 78, 216, 0.35);
}
</style>
