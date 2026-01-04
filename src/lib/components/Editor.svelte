<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let value = ''
  export let title = 'Input'

  let textarea: HTMLTextAreaElement

  const dispatch = createEventDispatcher<{
    input: string
    scroll: number
  }>()

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    value = target.value
    dispatch('input', value)
  }

  const handleScroll = () => {
    if (!textarea) return
    const { scrollTop, scrollHeight, clientHeight } = textarea
    const maxScroll = scrollHeight - clientHeight
    const percent = maxScroll > 0 ? scrollTop / maxScroll : 0
    dispatch('scroll', percent)
  }

  export const scrollTo = (percent: number) => {
    if (!textarea) return
    const { scrollHeight, clientHeight } = textarea
    const maxScroll = scrollHeight - clientHeight
    textarea.scrollTop = maxScroll * percent
  }
</script>

<section class="panel editor">
  <header class="panel__header">
    <div class="panel__title">{title}</div>
  </header>
  <textarea
    bind:this={textarea}
    class="editor__textarea"
    value={value}
    on:input={handleInput}
    on:scroll={handleScroll}
    placeholder="开始输入 Markdown..."
  ></textarea>
</section>

