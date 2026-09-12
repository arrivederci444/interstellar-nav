<script setup>
defineProps({
  tabs: { type: Array, required: true },
  activeTab: { type: String, required: true },
  originName: { type: String, default: '我的位置' },
  destinationName: { type: String, default: '地球' },
  waypoints: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:activeTab', 'action', 'open-search', 'back', 'remove-waypoint'])
</script>

<template>
  <header class="top-panel">
    <div class="locations">
      <button class="back" @click="emit('back')">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M15 5 L8 12 L15 19" fill="none" stroke="#1a2233" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="loc-list">
        <div class="loc origin-loc" @click="emit('open-search', 'origin')">
          <span class="dot green" />
          <span class="loc-text">{{ originName }}</span>
          <span class="search-hint">🔍</span>
        </div>
        <div v-for="(w, i) in waypoints" :key="w.id + '-' + i" class="loc waypoint-loc">
          <span class="dot blue" />
          <span class="loc-text">{{ w.name }}</span>
          <button class="wp-remove" @click.stop="emit('remove-waypoint', i)">✕</button>
        </div>
        <div class="loc dest-loc" @click="emit('open-search', 'destination')">
          <span class="dot red" />
          <span class="loc-text">{{ destinationName }}</span>
          <span class="search-hint">🔍</span>
        </div>
      </div>
      <div class="loc-actions">
        <button class="icon-btn" title="路况" @click="emit('action', '实时路况')">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 2 L21 20 H3 Z" fill="none" stroke="#1a2233" stroke-width="2" stroke-linejoin="round" />
            <path d="M12 8 v6" stroke="#1a2233" stroke-width="2" stroke-linecap="round" />
            <circle cx="12" cy="17" r="1.2" fill="#1a2233" />
          </svg>
        </button>
        <button class="icon-btn" title="添加途经点" @click="emit('open-search', 'waypoint')">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 5 v14 M5 12 h14" stroke="#1a2233" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </button>
        <button class="ai-btn" title="AI 语音" @click="emit('action', 'AI 语音助手')">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" />
            <path d="M6 11 a6 6 0 0 0 12 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" />
            <path d="M12 17 v4" stroke="#fff" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="ai-tag">AI</span>
        </button>
      </div>
    </div>

    <nav class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: tab.id === activeTab }"
        @click="emit('update:activeTab', tab.id)"
      >
        <span v-if="tab.icon" class="tab-ico">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.expandable && tab.id === activeTab" class="caret">▾</span>
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.top-panel {
  position: absolute;
  top: 46px;
  left: 10px;
  right: 10px;
  z-index: 20;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 20px;
  padding: 12px 14px 6px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
}

.locations {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.back {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  flex-shrink: 0;
  margin-top: -2px;
}

.back:active {
  background: rgba(0, 0, 0, 0.06);
}

.loc-list {
  flex: 1;
  min-width: 0;
  max-height: 132px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 2px;
}

.waypoint-loc {
  cursor: default;
}

.wp-remove {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  color: #8a94a6;
  background: #f0f3f9;
  flex-shrink: 0;
}

.wp-remove:active {
  background: #e2e8f2;
}

.origin-loc,
.dest-loc {
  cursor: pointer;
  min-width: 0;
}

.origin-loc:active .loc-text,
.dest-loc:active .loc-text {
  color: #1677ff;
}

.loc {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.green {
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18);
}

.dot.red {
  background: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.16);
}

.dot.blue {
  background: #2b8cff;
  box-shadow: 0 0 0 4px rgba(43, 140, 255, 0.16);
}

.loc-text {
  font-size: 18px;
  font-weight: 600;
  color: #1a2233;
  letter-spacing: 1px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-hint {
  font-size: 13px;
  opacity: 0.45;
  margin-left: 2px;
}

.loc-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  transition: background 0.15s ease;
}

.icon-btn:active {
  background: rgba(0, 0, 0, 0.06);
}

.ai-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #37b6ff, #1677ff);
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.4);
  transition: transform 0.15s ease;
}

.ai-btn:active {
  transform: scale(0.92);
}

.ai-tag {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 9px;
  font-weight: 700;
  color: #1677ff;
  background: #fff;
  border-radius: 6px;
  padding: 1px 3px;
  border: 1px solid #cfe3ff;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 8px;
  padding: 8px 2px 6px 0;
  overflow-x: auto;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  padding: 8px 9px;
  border-radius: 13px;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  transition: all 0.2s ease;
}

.tab.active {
  color: #1677ff;
  font-weight: 700;
  background: #eaf2ff;
}

.tab-ico {
  font-size: 15px;
}

.tab-label {
  letter-spacing: 0.5px;
}

.caret {
  font-size: 12px;
  color: #1677ff;
}

.badge {
  position: absolute;
  top: -6px;
  right: -2px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 8px;
  transform: scale(0.9);
}
</style>
