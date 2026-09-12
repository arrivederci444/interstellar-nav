<script setup>
defineProps({
  routes: { type: Array, required: true },
  selectedId: { type: String, required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="route-strip">
    <button
      v-for="r in routes"
      :key="r.id"
      class="route-card"
      :class="{ selected: r.id === selectedId }"
      @click="emit('select', r.id)"
    >
      <div class="distance">
        <span class="num">{{ r.distanceNum }}</span>
        <span class="unit">{{ r.distanceUnit }}</span>
      </div>
      <p class="eta">{{ r.eta }}</p>
      <p class="desc">{{ r.desc }}</p>
      <div class="tag" :style="{ color: r.color }">
        <span class="tag-ico">{{ r.tagIcon }}</span>
        <span>{{ r.tag }}</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.route-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 0 4px;
}

.route-card {
  flex: 0 0 auto;
  width: 132px;
  text-align: left;
  background: #fff;
  border-radius: 16px;
  border: 2px solid transparent;
  padding: 12px 12px 10px;
  box-shadow: 0 6px 16px rgba(20, 40, 90, 0.08);
  transition: transform 0.18s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.route-card:active {
  transform: scale(0.96);
}

.route-card.selected {
  border-color: #2b8cff;
  box-shadow: 0 8px 22px rgba(43, 140, 255, 0.25);
}

.distance {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.num {
  font-size: 24px;
  font-weight: 800;
  color: #1a2233;
  letter-spacing: -0.5px;
}

.unit {
  font-size: 13px;
  font-weight: 600;
  color: #1a2233;
}

.eta {
  margin: 6px 0 0;
  font-size: 12px;
  color: #4a5568;
  line-height: 1.35;
}

.desc {
  margin: 6px 0 8px;
  font-size: 12px;
  color: #8a94a6;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.tag-ico {
  font-size: 13px;
}
</style>
