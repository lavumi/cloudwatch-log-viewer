<script>
  import Sidebar from '$lib/components/Sidebar.svelte';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import LogViewer from '$lib/components/LogViewer.svelte';
  import { logGroups } from '$lib/stores/logGroups.svelte.js';
  import { viewState } from '$lib/stores/view.svelte.js';
</script>

<div class="app-layout">
  <Sidebar />

  <main class="main-content">
    {#if !logGroups.activeGroup}
      <div class="empty-state">
        <h2>시작하기</h2>
        <p>왼쪽 사이드바에서 + 버튼을 눌러 로그 그룹을 추가하세요.</p>
      </div>
    {:else if viewState.isSearchView}
      <div class="content-area">
        <FilterPanel />
      </div>
    {:else if viewState.isResultsView}
      <div class="content-area">
        <LogViewer />
      </div>
    {/if}
  </main>
</div>

<style>
  :global(body) {
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .app-layout {
    display: flex;
    height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .content-area {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    color: #546e7a;
    margin: 0 0 1rem 0;
  }

  .empty-state p {
    font-size: 1rem;
    color: #7f8c8d;
    margin: 0;
  }

  @media (prefers-color-scheme: dark) {
    .app-layout {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .empty-state h2 {
      color: #b0bec5;
    }

    .empty-state p {
      color: #95a5a6;
    }
  }

  @media (max-width: 768px) {
    .app-layout {
      flex-direction: column;
    }

    .content-area {
      padding: 1rem;
    }
  }
</style>
