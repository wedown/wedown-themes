<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let value = ''
  export let title = 'Input'

  const dispatch = createEventDispatcher<{ input: string }>()

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    value = target.value
    dispatch('input', value)
  }
</script>

<section class="panel editor">
  <header class="panel__header">
    <div class="panel__title">{title}</div>
  </header>
  <textarea
    class="editor__textarea"
    value={value}
    on:input={handleInput}
    placeholder="开始输入 Markdown..."
  />
</section>

