<script setup>
import { ref } from 'vue'

const open = ref(false)

const bodies = [
  { name: '水星', d: 4879, color: '#b8b0a8' },
  { name: '金星', d: 12104, color: '#e8c88a' },
  { name: '地球', d: 12742, color: '#4a90e2' },
  { name: '火星', d: 6779, color: '#c1541f' },
  { name: '木星', d: 139820, color: '#d8b48a' },
  { name: '土星', d: 116460, color: '#e0cf9a' },
  { name: '天王星', d: 50724, color: '#9fe3e8' },
  { name: '海王星', d: 49244, color: '#4a6fd8' },
]

function radius(d) {
  return Math.max(2.5, Math.round(Math.sqrt(d) * 0.038 * 10) / 10)
}
</script>

<template>
  <div class="scale-wrap" :class="{ open }">
    <button class="scale-toggle" @click="open = !open">
      <span class="ico">🪐</span>
      <span class="txt">比例尺</span>
    </button>

    <transition name="pop">
      <div v-if="open" class="scale-panel">
        <div class="panel-head">
          <span>星球比例尺</span>
          <span class="panel-sub">按真实直径</span>
        </div>
        <div class="bodies">
          <div v-for="b in bodies" :key="b.name" class="body">
            <span
              class="ball"
              :style="{ width: radius(b.d) * 2 + 'px', height: radius(b.d) * 2 + 'px', background: b.color }"
            />
            <span class="b-name">{{ b.name }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.scale-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.scale-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(140, 175, 255, 0.25);
  backdrop-filter: blur(8px);
  color: #dfe8ff;
  font-size: 11px;
  font-weight: 600;
  transition: transform 0.15s ease, background 0.2s ease;
}

.scale-toggle:active {
  transform: scale(0.94);
}

.scale-wrap.open .scale-toggle {
  background: rgba(43, 140, 255, 0.85);
  color: #fff;
  border-color: transparent;
}

.ico {
  font-size: 13px;
}

.scale-panel {
  position: absolute;
  top: 34px;
  right: 0;
  width: 296px;
  padding: 12px 14px 14px;
  border-radius: 16px;
  background: rgba(10, 16, 40, 0.94);
  border: 1px solid rgba(140, 175, 255, 0.25);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(14px);
  z-index: 8;
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.panel-sub {
  font-size: 10px;
  font-weight: 400;
  color: rgba(200, 216, 255, 0.6);
}

.bodies {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 3px;
  height: 52px;
}

.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
}

.ball {
  border-radius: 50%;
  box-shadow: inset -3px -3px 6px rgba(0, 0, 0, 0.45), 0 0 8px rgba(120, 160, 255, 0.25);
}

.b-name {
  font-size: 9.5px;
  color: #dfe8ff;
  white-space: nowrap;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
