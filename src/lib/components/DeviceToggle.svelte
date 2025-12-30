<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { DeviceMode } from '../stores/themeStore'

  export let mode: DeviceMode = 'mobile'
  const dispatch = createEventDispatcher<{ change: DeviceMode }>()

  const setMode = (value: DeviceMode) => {
    mode = value
    dispatch('change', mode)
  }
</script>

<div class="device-toggle">
  <button
    class:active={mode === 'mobile'}
    type="button"
    on:click={() => setMode('mobile')}
  >
    手机
  </button>
  <button
    class:active={mode === 'desktop'}
    type="button"
    on:click={() => setMode('desktop')}
  >
    桌面
  </button>
</div>

