<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import HomePage from './components/HomePage.vue'

const GalaxyMap = defineAsyncComponent(() => import('./components/GalaxyMap.vue'))
import TopPanel from './components/TopPanel.vue'
import RouteOptions from './components/RouteOptions.vue'
import AiBanner from './components/AiBanner.vue'
import BottomBar from './components/BottomBar.vue'
import SearchPanel from './components/SearchPanel.vue'
import NavMode from './components/NavMode.vue'
import { computeRoutes, getLocation, getTransport, transports } from './data/galaxy.js'
import { getLocationPosition } from './data/stars.js'

const page = ref('home')
const origin = ref(getLocation('earth'))
const destination = ref(null)
const waypoints = ref([])

const activeTab = ref('warp')
const selectedRouteId = ref('classic')
const aiExpanded = ref(false)
const launching = ref(false)
const launchKey = ref(0)
const searchOpen = ref(false)
const searchMode = ref('destination')
const navigating = ref(false)
const navProgress = ref(0)
const immersive = ref(false)
const toast = ref('')
let toastTimer = null
let navTimer = null
let clockTimer = null

const clock = ref('')
const musicOn = ref(true)
const audioEl = ref(null)
const musicSrc = `${import.meta.env.BASE_URL}music/goodnight.mp3`

function tickClock() {
  const d = new Date()
  clock.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function tryPlayMusic() {
  const a = audioEl.value
  if (!a) return
  a.volume = 0.55
  a.play().catch(() => {
    /* 浏览器拦截自动播放，等首次交互再播 */
  })
}

function toggleMusic() {
  const a = audioEl.value
  if (!a) return
  if (a.paused) {
    a.play()
      .then(() => {
        musicOn.value = true
      })
      .catch(() => {})
  } else {
    a.pause()
    musicOn.value = false
  }
}

function onFirstGesture() {
  if (musicOn.value && audioEl.value && audioEl.value.paused) tryPlayMusic()
  window.removeEventListener('pointerdown', onFirstGesture)
}

onMounted(() => {
  tickClock()
  clockTimer = setInterval(tickClock, 10000)
  tryPlayMusic()
  window.addEventListener('pointerdown', onFirstGesture)
})

const tripDistance = computed(() => {
  if (!destination.value) return 0
  const pts = [origin.value, ...waypoints.value, destination.value]
  let sum = 0
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = getLocationPosition(pts[i])
    const b = getLocationPosition(pts[i + 1])
    sum += Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
  }
  return sum
})
const activeTransport = computed(() => getTransport(activeTab.value))
const routes = computed(() => computeRoutes(tripDistance.value, activeTransport.value))
const selectedRoute = computed(
  () => routes.value.find((r) => r.id === selectedRouteId.value) || routes.value[0],
)
const etaText = computed(() => selectedRoute.value.eta)
const searchSelectedId = computed(() => {
  if (searchMode.value === 'origin') return origin.value.id
  if (searchMode.value === 'waypoint') return ''
  return destination.value ? destination.value.id : ''
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 1900)
}

function openSearch(mode) {
  searchMode.value = mode
  searchOpen.value = true
}

function pickLocation(loc) {
  if (searchMode.value === 'origin') {
    origin.value = loc
    searchOpen.value = false
    if (page.value === 'route' && destination.value) {
      showToast(`出发地已更新为「${loc.name}」`)
    } else {
      showToast(`出发地已设为「${loc.name}」`)
    }
    return
  }
  if (searchMode.value === 'waypoint') {
    waypoints.value = [...waypoints.value, loc]
    searchOpen.value = false
    showToast(`已添加途经点「${loc.name}」`)
    return
  }
  destination.value = loc
  waypoints.value = []
  selectedRouteId.value = 'classic'
  searchOpen.value = false
  page.value = 'route'
  showToast(`目的地已设为「${loc.name}」`)
}

function removeWaypoint(index) {
  const w = waypoints.value[index]
  waypoints.value = waypoints.value.filter((_, i) => i !== index)
  if (w) showToast(`已移除途经点「${w.name}」`)
}

function goHome() {
  stopNavigate(true)
  page.value = 'home'
  destination.value = null
  waypoints.value = []
  selectedRouteId.value = 'classic'
}

function selectRoute(id) {
  selectedRouteId.value = id
  const r = routes.value.find((item) => item.id === id)
  if (r) showToast(`已切换航线：${r.distance} · ${r.desc}`)
}

function launch() {
  if (launching.value) return
  launching.value = true
  launchKey.value += 1
  showToast('飞船已点火，曲速引擎启动 🚀')
  setTimeout(() => {
    launching.value = false
    showToast(`已抵达目的地：${destination.value.name} 🌍`)
  }, 2300)
}

function startNavigate() {
  if (navigating.value || !destination.value) return
  navProgress.value = 0
  navigating.value = true
  aiExpanded.value = false
  showToast(`开始导航 · ${selectedRoute.value.eta}`)
  clearInterval(navTimer)
  navTimer = setInterval(() => {
    navProgress.value = Math.min(1, navProgress.value + 0.008)
    if (navProgress.value >= 1) {
      clearInterval(navTimer)
      showToast(`已抵达 ${destination.value.name}，导航结束`)
    }
  }, 120)
}

function stopNavigate(silent = false) {
  clearInterval(navTimer)
  if (navigating.value && !silent) showToast('已结束导航')
  navigating.value = false
}

function handleAction(name) {
  showToast(`已打开「${name}」`)
}

function handleLocate() {
  showToast('已回到我的位置')
}

function handlePreference() {
  showToast('偏好设置：舒适度 · 风景优先')
}

function handleMapInteract() {
  if (!navigating.value && !immersive.value) {
    immersive.value = true
  }
}

onBeforeUnmount(() => {
  clearInterval(navTimer)
  clearTimeout(toastTimer)
  clearInterval(clockTimer)
  window.removeEventListener('pointerdown', onFirstGesture)
})
</script>

<template>
  <div class="phone">
    <div class="statusbar">
      <span class="time">{{ clock }}</span>
      <span class="notch" />
      <span class="signals">
        <button class="music-btn" :title="musicOn ? '暂停音乐' : '播放音乐'" @click="toggleMusic">
          {{ musicOn ? '🔊' : '🔇' }}
        </button>
        <span class="bars"><i /><i /><i /><i /></span>
        <span class="wifi">📶</span>
        <span class="battery">91</span>
      </span>
    </div>

    <audio ref="audioEl" :src="musicSrc" loop preload="auto" />

    <HomePage
      v-if="page === 'home'"
      @open-search="openSearch"
      @pick="pickLocation"
    />

    <template v-else>
      <GalaxyMap
        :route="selectedRoute"
        :origin="origin"
        :destination="destination"
        :waypoints="waypoints"
        :rocket-flying="launching"
        :launch-key="launchKey"
        :navigating="navigating"
        :nav-progress="navProgress"
        :immersive="immersive"
        @action="handleAction"
        @locate="handleLocate"
        @preference="handlePreference"
        @toggle-immersive="immersive = !immersive"
        @map-interact="handleMapInteract"
      />

      <transition name="panel-up">
        <TopPanel
          v-if="!navigating && !immersive"
          :tabs="transports"
          :active-tab="activeTab"
          :origin-name="origin.name"
          :destination-name="destination.name"
          :waypoints="waypoints"
          @update:active-tab="(v) => (activeTab = v)"
          @action="handleAction"
          @open-search="openSearch"
          @remove-waypoint="removeWaypoint"
          @back="goHome"
        />
      </transition>

      <transition name="panel-down">
        <section v-if="!navigating && !immersive" class="sheet">
          <RouteOptions :routes="routes" :selected-id="selectedRouteId" @select="selectRoute" />
          <AiBanner
            :expanded="aiExpanded"
            :route="selectedRoute"
            :destination="destination"
            @toggle="aiExpanded = !aiExpanded"
          />
          <BottomBar
            :launching="launching"
            @action="handleAction"
            @launch="launch"
            @navigate="startNavigate"
          />
        </section>
      </transition>

      <NavMode
        v-if="navigating"
        :route="selectedRoute"
        :destination="destination"
        :origin-name="origin.name"
        :transport="activeTransport"
        :progress="navProgress"
        @stop="stopNavigate"
      />
    </template>

    <SearchPanel
      :open="searchOpen"
      :origin-name="origin.name"
      :mode="searchMode"
      :selected-id="searchSelectedId"
      @close="searchOpen = false"
      @select="pickLocation"
    />

    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<style scoped>
.phone {
  position: relative;
  width: 100%;
  max-width: 430px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  background: #04060f;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.7);
}

.statusbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 42px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  pointer-events: none;
}

.notch {
  width: 90px;
  height: 22px;
  background: #04060f;
  border-radius: 0 0 14px 14px;
  margin-top: -8px;
}

.signals {
  display: flex;
  align-items: center;
  gap: 6px;
}

.music-btn {
  font-size: 13px;
  line-height: 1;
  pointer-events: auto;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
}

.music-btn:active {
  transform: scale(0.9);
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.bars i {
  width: 3px;
  background: #fff;
  border-radius: 1px;
}

.bars i:nth-child(1) {
  height: 5px;
}
.bars i:nth-child(2) {
  height: 7px;
}
.bars i:nth-child(3) {
  height: 9px;
}
.bars i:nth-child(4) {
  height: 11px;
}

.wifi {
  font-size: 12px;
}

.battery {
  padding: 1px 5px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
}

.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 14px 14px calc(10px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), #ffffff 22%);
  border-radius: 26px 26px 0 0;
  box-shadow: 0 -10px 34px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(18px);
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 44%;
  transform: translateX(-50%);
  z-index: 70;
  max-width: 80%;
  padding: 10px 18px;
  border-radius: 22px;
  background: rgba(20, 26, 48, 0.92);
  color: #fff;
  font-size: 13.5px;
  text-align: center;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.28s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.panel-up-enter-active,
.panel-up-leave-active {
  transition: transform 0.34s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.34s ease;
}
.panel-up-enter-from,
.panel-up-leave-to {
  transform: translateY(-130%);
  opacity: 0;
}

.panel-down-enter-active,
.panel-down-leave-active {
  transition: transform 0.34s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.34s ease;
}
.panel-down-enter-from,
.panel-down-leave-to {
  transform: translateY(120%);
  opacity: 0;
}
</style>
