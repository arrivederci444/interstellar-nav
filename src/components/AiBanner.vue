<script setup>
import { computed } from 'vue'
import { routeTier } from '../data/galaxy.js'

const props = defineProps({
  expanded: { type: Boolean, default: false },
  route: { type: Object, required: true },
  destination: { type: Object, required: true },
})

const emit = defineEmits(['toggle'])

const tier = computed(() => routeTier(props.route.distanceLy))
const title = computed(() => {
  if (tier.value === 'solar') {
    return `AI 航路规划：前往 ${props.destination.name}，已规划最优转移轨道`
  }
  if (tier.value === 'deep') {
    return `AI 航路规划：前往 ${props.destination.name}，已规划虫洞与超空间中继`
  }
  return `AI 航路规划：前往 ${props.destination.name}，已避开星际海盗与高辐射区`
})
const sub = computed(() =>
  tier.value === 'solar' ? '已避开小行星带与强辐射区 🛰️' : '本次航行适宜携带猫咪和零食 😊',
)
const relayText = computed(() =>
  tier.value === 'solar' ? '地面深空测控网' : `${3 + props.route.id.length} 个曲速中继站`,
)
</script>

<template>
  <section class="ai-banner" :class="{ expanded }" @click="emit('toggle')">
    <div class="avatar">
      <span>🤖</span>
      <i class="ai-badge">AI</i>
    </div>

    <div class="ai-body">
      <p class="ai-title">{{ title }}</p>
      <p class="ai-sub">{{ sub }}</p>

      <transition name="expand">
        <ul v-if="expanded" class="ai-detail">
          <li>· 当前航线：{{ route.distance }}，{{ route.eta }}</li>
          <li>· 沿途 {{ route.desc }}，{{ route.tag }}</li>
          <li>· 已接入 {{ relayText }}</li>
        </ul>
      </transition>
    </div>

    <div class="ai-right">
      <div class="wave">
        <span v-for="n in 5" :key="n" :style="{ height: 6 + n * 3 + 'px' }" />
      </div>
      <span class="chevron" :class="{ up: expanded }">^</span>
    </div>
  </section>
</template>

<style scoped>
.ai-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 6px 16px rgba(20, 40, 90, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.ai-banner.expanded {
  box-shadow: 0 10px 26px rgba(43, 140, 255, 0.2);
}

.avatar {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f1ff, #cfe3ff);
  display: grid;
  place-items: center;
  font-size: 22px;
  flex-shrink: 0;
}

.ai-badge {
  position: absolute;
  bottom: -3px;
  right: -3px;
  font-size: 9px;
  font-style: normal;
  font-weight: 700;
  color: #fff;
  background: #1677ff;
  padding: 1px 4px;
  border-radius: 7px;
  border: 1.5px solid #fff;
}

.ai-body {
  flex: 1;
  min-width: 0;
}

.ai-title {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 700;
  color: #1a2233;
  line-height: 1.35;
}

.ai-sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8a94a6;
}

.ai-detail {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  font-size: 12.5px;
  color: #4a5568;
  line-height: 1.8;
}

.ai-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  align-self: center;
}

.wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 22px;
}

.wave span {
  width: 3px;
  border-radius: 2px;
  background: #2b8cff;
  animation: wave 1s ease-in-out infinite;
}

.wave span:nth-child(2) {
  animation-delay: 0.15s;
}
.wave span:nth-child(3) {
  animation-delay: 0.3s;
}
.wave span:nth-child(4) {
  animation-delay: 0.45s;
}
.wave span:nth-child(5) {
  animation-delay: 0.6s;
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.5);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1.2);
    opacity: 1;
  }
}

.chevron {
  font-size: 12px;
  color: #8a94a6;
  transition: transform 0.25s ease;
  line-height: 1;
}

.chevron.up {
  transform: rotate(180deg);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
