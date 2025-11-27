<script>
  import { filters, parseTrid } from '../stores/filters.svelte.js';
  import { viewState } from '../stores/view.svelte.js';
  import FilterDetailModal from './FilterDetailModal.svelte';

  let tridInput = $state('');
  let tridParseError = $state('');
  let showDetailModal = $state(false);

  function handleTridInputChange() {
    tridParseError = '';
  }

  function handleSearch() {
    tridParseError = '';

    if (!tridInput.trim()) {
      tridParseError = 'Please enter a TRID';
      return;
    }

    const success = filters.setFromTrid(tridInput.trim());
    if (!success) {
      tridParseError = 'Invalid TRID format. Expected format: YYYYMMDDHHMMSS... (e.g., 20251125091033515637)';
      return;
    }

    // Apply 와 동시에 결과 화면으로 전환
    viewState.showResults();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<div class="filter-panel">
  <div class="panel-header">
    <h3>🔍 Quick Search</h3>
    <button class="btn-detail" onclick={() => showDetailModal = true}>
      Detail Filters
    </button>
  </div>

  <div class="trid-input-group">
    <input
      type="text"
      bind:value={tridInput}
      oninput={handleTridInputChange}
      onkeydown={handleKeyDown}
      placeholder="Enter TRID (e.g., 20251125091033515637)"
      class="trid-input"
    />
  </div>
  
  <div class="search-button-container">
    <button
      class="btn-search"
      onclick={handleSearch}
      disabled={!tridInput.trim()}
    >
      Search
    </button>
  </div>

  {#if tridParseError}
    <div class="error-message">
      <span class="error-icon">⚠</span>
      {tridParseError}
    </div>
  {/if}
</div>

{#if showDetailModal}
  <FilterDetailModal onClose={() => showDetailModal = false} />
{/if}

<style>
  .filter-panel {
    max-width: 600px;
    width: 100%;
    padding: 2.5rem;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .btn-detail {
    padding: 0.5rem 1rem;
    background-color: #95a5a6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-detail:hover {
    background-color: #7f8c8d;
    transform: translateY(-1px);
  }

  .trid-input-group {
    display: flex;
    width: 100%;
  }

  .trid-input {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 2px solid #ddd;
    border-radius: 10px;
    font-size: 1rem;
    font-family: 'Courier New', monospace;
    background-color: white;
    color: #333;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .search-button-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .trid-input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  .btn-search {
    padding: 0.875rem 3rem;
    background-color: #27ae60;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1.05rem;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
    min-width: 200px;
  }

  .btn-search:hover:not(:disabled) {
    background-color: #229954;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
  }

  .btn-search:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-search:active:not(:disabled) {
    transform: translateY(0);
  }

  .error-message {
    margin-top: 0;
    padding: 0.875rem 1rem;
    background-color: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 8px;
    color: #856404;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .error-icon {
    font-size: 1.1rem;
  }

  @media (prefers-color-scheme: dark) {
    .filter-panel {
      background-color: rgba(26, 26, 46, 0.95);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    h3 {
      color: #f6f6f6;
    }

    .trid-input {
      background-color: #1a1a1a;
      color: #f6f6f6;
      border-color: #444;
    }

    .trid-input:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .error-message {
      background-color: rgba(241, 196, 15, 0.2);
      border-color: #f39c12;
      color: #f1c40f;
    }
  }

  @media (max-width: 640px) {
    .filter-panel {
      padding: 1.5rem;
      max-width: 100%;
    }

    .panel-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .btn-search {
      width: 100%;
      min-width: auto;
    }
  }
</style>
