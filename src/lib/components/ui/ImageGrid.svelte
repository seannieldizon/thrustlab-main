<script lang="ts">
  export let images: Array<{src:string, alt?:string, caption?:string, noZoom?: boolean}> = [];
  export let columns: number = 3; // 1,2,3
  export let gap: string = '1rem';
  export let centered: boolean = true;
  export let height: string | null = null; // e.g. '220px' or 'clamp(200px, 22vw, 320px)'
  export let rounded: string = '12px';
  export let borderStyle: string = '2px solid rgba(27,53,88,0.2)';

  const gridTemplate = () => `repeat(${columns}, 1fr)`;
</script>

<div class={"image-grid"} style={`--columns: ${columns}; --gap: ${gap}; --height: ${height ?? 'auto'}; --rounded: ${rounded}; --border: ${borderStyle}; --grid-template: ${gridTemplate()}; justify-items: ${centered ? 'center' : 'stretch'};`}>
  {#each images as image}
    <div class="image-cell" aria-label={image.alt || image.caption || ''}>
      {#if image.noZoom}
        <div class="image-placeholder">
          <img src={image.src} alt={image.alt || ''} class="no-zoom" />
        </div>
      {:else}
        <button class="image-placeholder" type="button">
          <img src={image.src} alt={image.alt || ''} />
        </button>
      {/if}
      {#if image.caption}
        <div class="image-caption">{image.caption}</div>
      {/if}
    </div>
  {/each}
</div>

<style>
:global(.image-grid) {
  display: grid;
  grid-template-columns: var(--grid-template, repeat(var(--columns), 1fr));
  gap: var(--gap, 1rem);
  width: 100%;
  justify-content: center;
  margin: 0 auto;
}

/* Setup grid-template-from columns prop (fallback to CSS var) */
.image-grid {
  grid-template-columns: repeat(var(--columns), 1fr);
}

.image-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-placeholder {
  width: 100%;
  height: var(--height, auto);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02));
  border-radius: var(--rounded);
  border: var(--border);
  padding: 0.6rem;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.image-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* preserve aspect ratio, don't crop */
}

.image-placeholder:focus {
  outline: 3px solid rgba(0, 206, 209, 0.35);
  box-shadow: 0 8px 24px rgba(0, 206, 209, 0.08);
}

.image-placeholder img.no-zoom {
  cursor: default;
}

.image-caption {
  margin-top: 0.5rem;
  font-weight: 600;
  color: #1a2b47;
  font-size: 0.95rem;
  text-align: center;
}

/* Responsive fallback */
@media (max-width: 1024px) {
  .image-grid {
    grid-template-columns: 1fr !important; /* stack single column on tablet/smaller */
  }
  .image-placeholder {
    height: auto;
  }
}
</style>
