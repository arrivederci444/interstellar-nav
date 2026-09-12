<script setup>
import { computed } from 'vue'
import { formatDistance, formatDuration, routeTier } from '../data/galaxy.js'

const props = defineProps({
  route: { type: Object, required: true },
  destination: { type: Object, required: true },
  originName: { type: String, default: '我的位置' },
  transport: { type: Object, required: true },
  progress: { type: Number, default: 0 },
})

const emit = defineEmits(['stop'])

const remainLy = computed(() => props.route.distanceLy * (1 - props.progress))
const remainText = computed(() =>
  remainLy.value < 0.0000001 ? '已抵达' : formatDistance(remainLy.value),
)
const remainTime = computed(() => formatDuration(props.route.hours * (1 - props.progress)))

const instruction = computed(() => {
  const p = props.progress
  const solar = routeTier(props.route.distanceLy) === 'solar'
  if (p < 0.06) return { icon: '🚀', text: `离开 ${props.originName}，进入 ${props.transport.label} 航道` }
  if (p < 0.2) return { icon: '↗', text: '沿规划航线前进' }
  if (p < 0.34) {
    return solar
      ? { icon: '🛰️', text: `前方 ${formatDistance(remainLy.value * 0.4)} 执行中途修正` }
      : { icon: '🕳️', text: `前方 ${formatDistance(remainLy.value * 0.4)} 进入虫洞` }
  }
  if (p < 0.5) return { icon: '⚡', text: solar ? '保持巡航，注意空间碎片' : '保持航行，注意星际碎片' }
  if (p < 0.64) return { icon: '🛰️', text: '即将经过充能中继站' }
  if (p < 0.78) {
    return solar
      ? { icon: '🪐', text: '掠过行星引力场' }
      : { icon: '🌠', text: '穿越猎户座星云' }
  }
  if (p < 0.92) return { icon: '🪐', text: `正在接近 ${props.destination.name}` }
  if (p < 1) return { icon: '🛬', text: '准备减速，进入泊入轨道' }
  return { icon: '✅', text: `已抵达 ${props.destination.name}` }
})
</script>

<template>
  <div class="nav-layer">
    <div class="nav-top">
      <div class="maneuver">{{ instruction.icon }}</div>
      <div class="nav-text">
        <p class="nav-main">{{ instruction.text }}</p>
        <p class="nav-sub">{{ remainText }} · {{ remainTime }}</p>
      </div>
      <div class="warp">
        <span class="warp-label">{{ transport.icon }} {{ transport.label }}</span>
        <span class="warp-num">{{ transport.speedText }}</span>
      </div>
    </div>

    <div class="nav-bottom">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: Math.min(100, progress * 100) + '%' }" />
      </div>
      <div class="stats">
        <div class="stat">
          <span class="stat-num">{{ remainText }}</span>
          <span class="stat-label">剩余距离</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ remainTime }}</span>
          <span class="stat-label">预计到达</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ Math.round(progress * 100) }}%</span>
          <span class="stat-label">航行进度</span>
        </div>
      </div>
      <div class="nav-actions">
        <button class="nav-btn ghost" @click="emit('stop')">结束导航</button>
        <button class="nav-btn primary">语音播报</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-layer {
  position: absolute;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.nav-top {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 50px 12px 0;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(12, 20, 48, 0.9);
  border: 1px solid rgba(120, 160, 255, 0.28);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
  color: #fff;
}

.maneuver {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 24px;
  background: linear-gradient(135deg, #37b6ff, #1677ff);
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.45);
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  min-width: 0;
}

.nav-main {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.nav-sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: rgba(220, 232, 255, 0.75);
}

.warp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.14);
  max-width: 84px;
}

.warp-label {
  font-size: 10px;
  color: rgba(220, 232, 255, 0.65);
  white-space: nowrap;
}

.warp-num {
  font-size: 14px;
  font-weight: 800;
  color: #5eead4;
  white-space: nowrap;
}

.nav-bottom {
  pointer-events: auto;
  margin: 0 12px calc(12px + env(safe-area-inset-bottom));
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
}

.progress-track {
  height: 6px;
  border-radius: 4px;
  background: #e6ebf5;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #37b6ff, #1677ff);
  transition: width 0.4s linear;
}

.stats {
  display: flex;
  margin: 14px 0 14px;
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.stat + .stat {
  border-left: 1px solid #eef1f7;
}

.stat-num {
  font-size: 16px;
  font-weight: 800;
  color: #1a2233;
}

.stat-label {
  font-size: 11px;
  color: #8a94a6;
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.nav-btn {
  flex: 1;
  height: 48px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
}

.nav-btn.ghost {
  background: #eef2f9;
  color: #4a5568;
}

.nav-btn.primary {
  background: linear-gradient(135deg, #37b6ff, #1677ff);
  color: #fff;
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.35);
}

.nav-btn:active {
  transform: scale(0.97);
}
</style>
