<template>
  <div class="classroom-picker" :class="`classroom-picker--${variant}`">
    <!-- Search (real-time) -->
    <div class="classroom-picker__search">
      <span class="classroom-picker__search-icon">
        <IconSearch :size="variant === 'header' ? 14 : 15" />
      </span>
      <input
        v-model="search"
        type="text"
        class="classroom-picker__search-input"
        :placeholder="searchPlaceholder"
        :disabled="isDisabled"
      />
      <button
        v-if="search"
        type="button"
        class="classroom-picker__search-clear"
        title="ล้างคำค้น"
        @click="search = ''"
      >
        ✕
      </button>
    </div>

    <!-- Level / Room dropdowns -->
    <div class="classroom-picker__row">
      <select
        v-model="level"
        class="classroom-picker__select"
        :disabled="isDisabled || levels.length === 0"
      >
        <option value="" disabled>{{ levelPlaceholder }}</option>
        <option v-for="item in levels" :key="item" :value="item">
          {{ item }}
        </option>
      </select>

      <span class="classroom-picker__slash">/</span>

      <select
        v-model="roomId"
        class="classroom-picker__select"
        :disabled="isDisabled || roomsInLevel.length === 0"
      >
        <option value="" disabled>{{ roomPlaceholder }}</option>
        <option v-for="item in roomsInLevel" :key="item.id" :value="item.id">
          {{ item.room }}{{ item.countText }}
        </option>
      </select>
    </div>

    <p v-if="notice" class="classroom-picker__notice">{{ notice }}</p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import IconSearch from '@/components/icons/IconSearch.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  classrooms: {
    type: Array,
    default: () => []
  },
  variant: {
    type: String,
    default: 'form'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'ค้นหาห้องเรียน...'
  },
  levelPlaceholder: {
    type: String,
    default: 'ชั้น'
  },
  roomPlaceholder: {
    type: String,
    default: 'ห้อง'
  }
})

const emit = defineEmits(['update:modelValue'])

const search = ref('')
const level = ref('')
const roomId = ref('')

const isDisabled = computed(() => props.disabled || props.classrooms.length === 0)

/** "ม.4/1" → { level: "ม.4", room: "1" } */
function parseRoom(name) {
  const raw = String(name ?? '').trim()
  const idx = raw.indexOf('/')
  if (idx === -1) return { level: raw, room: '—' }
  return { level: raw.slice(0, idx).trim(), room: raw.slice(idx + 1).trim() }
}

/** เทียบชื่อแบบธรรมชาติ: ม.1 < ม.2 < ... < ม.10 */
function compareLabel(a, b) {
  return String(a).localeCompare(String(b), 'th', {
    numeric: true,
    sensitivity: 'base'
  })
}

function readCount(room) {
  if (typeof room.count === 'number') return room.count
  const fromMeta = room._count?.enrollments
  return typeof fromMeta === 'number' ? fromMeta : null
}

/** รายการห้องที่ผ่านตัวกรองค้นหา (พร้อม level/room ที่แยกแล้ว) */
const matchedRooms = computed(() => {
  const q = search.value.trim().toLowerCase()

  return props.classrooms
    .map((room) => {
      const { level: lv, room: rm } = parseRoom(room.name)
      const count = readCount(room)
      return {
        id: room.id,
        name: room.name,
        level: lv,
        room: rm,
        countText: count === null ? '' : ` (${count})`
      }
    })
    .filter((room) => !q || room.name.toLowerCase().includes(q))
    .sort(
      (a, b) =>
        compareLabel(a.level, b.level) || compareLabel(a.room, b.room)
    )
})

const levels = computed(() => {
  const unique = new Set(matchedRooms.value.map((room) => room.level))
  return [...unique].sort(compareLabel)
})

const roomsInLevel = computed(() =>
  matchedRooms.value.filter((room) => room.level === level.value)
)

function firstRoomOfLevel(lv) {
  return matchedRooms.value.find((room) => room.level === lv) ?? null
}

/** ตั้งค่า level/room ให้ตรงกับ classroomId ที่ถูกเลือกอยู่ */
function syncFromModel(id) {
  const found = props.classrooms.find((room) => room.id === id)
  if (found) {
    level.value = parseRoom(found.name).level
    roomId.value = found.id
    return true
  }
  return false
}

// parent เปลี่ยนค่าที่เลือก → sync ลงช่อง level/room
watch(
  () => [props.modelValue, props.classrooms],
  () => {
    if (props.modelValue && syncFromModel(props.modelValue)) return
    // ยังไม่มีค่าเลือก แต่มีห้องให้เลือก → เลือกห้องแรกให้อัตโนมัติ
    if (!props.modelValue && matchedRooms.value.length > 0) {
      const first = matchedRooms.value[0]
      level.value = first.level
      roomId.value = first.id
    }
  },
  { immediate: true }
)

// เปลี่ยนชั้น → เลือกห้องแรกของชั้นนั้น
watch(level, (lv) => {
  if (!lv) return
  if (roomsInLevel.value.some((room) => room.id === roomId.value)) return
  const first = firstRoomOfLevel(lv)
  roomId.value = first ? first.id : ''
})

// ค้นหาแล้วห้องที่เลือกถูกกรองออก → เลื่อนไปห้องแรกที่ตรงกัน
watch(matchedRooms, (list) => {
  if (list.length === 0) return
  if (list.some((room) => room.id === roomId.value)) return
  const first = list[0]
  level.value = first.level
  roomId.value = first.id
})

// ส่งค่าให้ parent เมื่อห้องเปลี่ยน
watch(roomId, (id) => {
  if (id !== props.modelValue) emit('update:modelValue', id)
})

const notice = computed(() => {
  if (props.loading) return 'กำลังโหลดห้องเรียน...'
  if (props.classrooms.length === 0) return 'ยังไม่มีห้องเรียน'
  if (matchedRooms.value.length === 0) return 'ไม่พบห้องเรียนที่ตรงกับคำค้น'
  return ''
})
</script>

<style scoped src="@/assets/styles/components/classroom-picker.css"></style>
