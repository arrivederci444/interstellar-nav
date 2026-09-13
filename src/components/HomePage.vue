<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getLocation } from '../data/galaxy.js'
import { recommendations } from '../data/recommendations.js'
import PlanetScale from './PlanetScale.vue'

const emit = defineEmits(['open-search', 'pick'])

const expanded = ref(false)
let startY = 0
let dragging = false

function toggle() {
  expanded.value = !expanded.value
}

function onPointerDown(e) {
  dragging = true
  startY = e.clientY
}

function onPointerMove(e) {
  if (!dragging) return
  const dy = e.clientY - startY
  if (dy < -45) {
    expanded.value = true
    dragging = false
  } else if (dy > 45) {
    expanded.value = false
    dragging = false
  }
}

function onPointerUp() {
  dragging = false
}

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

function open(rec) {
  emit('pick', getLocation(rec.locationId))
}
</script>

<template>
  <div class="home">
    <div class="starfield" />
    <div class="glow glow-a" />

    <div class="cover">
      <div class="brand-top">
        <span class="brand">🚀 星际航行</span>
      </div>
      <div class="scale-slot">
        <PlanetScale />
      </div>

      <div class="hero">
        <div class="planet">🪐</div>
        <h1 class="hero-title">探索银河系</h1>
        <p class="hero-sub">2.6 万光年之内，任你抵达</p>
      </div>

      <button class="search-entry" @click="emit('open-search', 'destination')">
        <span class="s-ico">🔍</span>
        <span class="s-ph">搜索目的地</span>
      </button>
    </div>

    <section class="sheet" :class="{ expanded }">
      <div class="sheet-head" @click="toggle" @pointerdown="onPointerDown">
        <span class="grabber" />
        <div class="sheet-row">
          <span class="sheet-title">✨ 银河系旅行灵感</span>
          <span class="sheet-hint">{{ expanded ? '下滑收起' : '上滑查看' }}</span>
        </div>
      </div>

      <div class="sheet-body">
        <div class="masonry">
          <button v-for="rec in recommendations" :key="rec.id" class="rec-card" @click="open(rec)">
            <div class="rec-cover" :style="{ background: rec.cover.gradient, height: rec.cover.h + 'px' }">
              <span class="rec-emoji">{{ rec.cover.emoji }}</span>
              <span class="rec-loc">📍 {{ getLocation(rec.locationId).name }}</span>
            </div>
            <div class="rec-body">
              <p class="rec-title">{{ rec.title }}</p>
              <p class="rec-desc">{{ rec.desc }}</p>
              <div class="rec-tags">
                <span v-for="t in rec.tags" :key="t">#{{ t }}</span>
              </div>
              <div class="rec-foot">
                <span class="rec-author">
                  <i class="avatar">{{ rec.avatar }}</i>
                  {{ rec.author }}
                </span>
                <span class="rec-likes">♡ {{ rec.likes }}</span>
              </div>
            </div>
          </button>
        </div>
        <p class="feed-end">— 已经滑到银河系尽头了 —</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  position: absolute;
  inset: 0;
  z-index: 10;
  overflow: hidden;
  background: radial-gradient(circle at 50% 22%, #1a2a6b 0%, #0a1130 45%, #04060f 100%);
  color: #fff;
}

.starfield {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.2px 1.2px at 40px 60px, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 150px 130px, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1.3px 1.3px at 90px 220px, rgba(200, 220, 255, 0.7), transparent),
    radial-gradient(1px 1px at 200px 300px, rgba(255, 255, 255, 0.5), transparent);
  background-size: 260px 360px;
  opacity: 0.7;
}

.glow {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(59, 130, 246, 0.28);
}

/* 封面 */
.cover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px 120px;
}

.brand-top {
  position: absolute;
  top: 52px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.scale-slot {
  position: absolute;
  top: 92px;
  right: 14px;
  z-index: 9;
}

.brand {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 1px;
}

.brand-sub {
  font-size: 11px;
  color: rgba(200, 216, 255, 0.55);
}

.hero {
  text-align: center;
  margin-bottom: 30px;
}

.planet {
  font-size: 56px;
  line-height: 1;
  animation: float 4.5s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-title {
  margin: 16px 0 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 3px;
  text-shadow: 0 0 26px rgba(90, 150, 255, 0.55);
}

.hero-sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgba(200, 216, 255, 0.7);
  letter-spacing: 1px;
}

.search-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 330px;
  padding: 15px 18px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease;
}

.search-entry:active {
  transform: scale(0.98);
}

.s-ico {
  font-size: 16px;
}

.s-ph {
  font-size: 15px;
  color: #8a94a6;
}

/* 底部抽屉 */
.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  height: 84px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(12, 20, 52, 0.94), rgba(5, 8, 22, 0.98));
  border-top: 1px solid rgba(140, 175, 255, 0.18);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(18px);
  overflow: hidden;
  transition: height 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.sheet.expanded {
  height: 84%;
}

.sheet-head {
  flex-shrink: 0;
  padding: 8px 16px 12px;
  cursor: grab;
  touch-action: none;
}

.grabber {
  display: block;
  width: 40px;
  height: 4px;
  border-radius: 3px;
  background: rgba(180, 205, 255, 0.4);
  margin: 0 auto 10px;
}

.sheet-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-title {
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.sheet-hint {
  font-size: 12px;
  color: rgba(200, 216, 255, 0.6);
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 14px calc(20px + env(safe-area-inset-bottom));
}

/* 瀑布流卡片 */
.masonry {
  columns: 2;
  column-gap: 10px;
}

.rec-card {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  break-inside: avoid;
  text-align: left;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(140, 175, 255, 0.16);
  border-radius: 16px;
  overflow: hidden;
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease, background 0.2s ease;
}

.rec-card:active {
  transform: scale(0.97);
  background: rgba(255, 255, 255, 0.12);
}

.rec-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-emoji {
  font-size: 52px;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
}

.rec-loc {
  position: absolute;
  left: 8px;
  bottom: 8px;
  font-size: 11px;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  padding: 3px 8px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
}

.rec-body {
  padding: 10px 10px 11px;
}

.rec-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  color: #ffffff;
}

.rec-desc {
  margin: 5px 0 0;
  font-size: 11.5px;
  line-height: 1.45;
  color: rgba(200, 216, 255, 0.68);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 7px;
}

.rec-tags span {
  font-size: 10.5px;
  color: #1677ff;
}

.rec-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 9px;
}

.rec-author {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(200, 216, 255, 0.6);
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-style: normal;
  flex-shrink: 0;
}

.rec-likes {
  font-size: 11px;
  color: #ff8fab;
  white-space: nowrap;
  flex-shrink: 0;
}

.feed-end {
  text-align: center;
  font-size: 12px;
  color: rgba(200, 216, 255, 0.4);
  margin: 16px 0 6px;
}
</style>
