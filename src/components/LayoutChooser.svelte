<script>
  import Select, { Option } from '@smui/select';

  export let trackerLayout = 'classic';
</script>

<Select bind:value={trackerLayout} variant="outlined" label="Tracker Layout Style" style="width: 220px;">
  <Option value="classic">Classic</Option>
  <Option value="compact1">Compact</Option>
</Select>
<div class="tracker-blurb">
  <span>
    {#if trackerLayout === 'classic'}
      A wider layout with all references to help you complete a seed.
    {:else}
      A compact layout for a runner more familiar with the regions and point values.
    {/if}
  </span>
</div>

<style>
  .tracker-blurb {
    display: inline-block;
    font-size: 0.8rem;
    line-height: 1.5;
    margin-left: 10px;
    vertical-align: middle;
    width: 240px;
  }
</style>
