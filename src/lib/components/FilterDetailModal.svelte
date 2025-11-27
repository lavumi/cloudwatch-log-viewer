<script>
  import { filters, DATE_PRESETS } from '../stores/filters.svelte.js';

  let { onClose } = $props();

  let localSearchQuery = $state(filters.searchQuery);
  let localDatePreset = $state(filters.datePreset);
  let localStartDate = $state(filters.startDate);
  let localEndDate = $state(filters.endDate);
  let localCaseSensitive = $state(filters.caseSensitive);
  let localUseRegex = $state(filters.useRegex);

  function getLocalDateTimeString(date) {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function setDefaultDateRange() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    localStartDate = getLocalDateTimeString(oneHourAgo);
    localEndDate = getLocalDateTimeString(now);
  }

  function handleApply() {
    filters.setSearchQuery(localSearchQuery);
    filters.setDatePreset(localDatePreset);

    if (localDatePreset === 'custom') {
      filters.setStartDate(localStartDate);
      filters.setEndDate(localEndDate);
    }

    if (localCaseSensitive !== filters.caseSensitive) {
      filters.toggleCaseSensitive();
    }

    if (localUseRegex !== filters.useRegex) {
      filters.toggleUseRegex();
    }

    onClose();
  }

  function handleReset() {
    filters.reset();
    localSearchQuery = '';
    localDatePreset = '1h';
    localStartDate = '';
    localEndDate = '';
    localCaseSensitive = false;
    localUseRegex = false;
  }

  function handleDatePresetChange() {
    if (localDatePreset === 'custom' && !localStartDate && !localEndDate) {
      setDefaultDateRange();
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

<div class="modal-backdrop" role="button" tabindex="0" onclick={handleBackdropClick} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleBackdropClick(e); } }}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Detail Filters</h2>
      <button class="btn-close" onclick={onClose}>×</button>
    </div>

    <div class="modal-body">
      <!-- 검색 쿼리 -->
      <div class="form-group">
        <label for="searchQuery">Search Query</label>
        <input
          id="searchQuery"
          type="text"
          bind:value={localSearchQuery}
          placeholder="Enter search text or pattern..."
          class="form-control"
        />
        <div class="search-options">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={localCaseSensitive} />
            <span>Case Sensitive</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={localUseRegex} />
            <span>Use Regex</span>
          </label>
        </div>
        <p class="help-text">
          {#if localUseRegex}
            Enter a regular expression pattern to filter logs
          {:else}
            Enter text to search in log messages
          {/if}
        </p>
      </div>

      <!-- 날짜 범위 -->
      <div class="form-group">
        <label for="datePreset">Time Range</label>
        <select
          id="datePreset"
          bind:value={localDatePreset}
          onchange={handleDatePresetChange}
          class="form-control"
        >
          {#each DATE_PRESETS as preset}
            <option value={preset.value}>{preset.label}</option>
          {/each}
        </select>
      </div>

      <!-- 커스텀 날짜 범위 -->
      {#if localDatePreset === 'custom'}
        <div class="custom-date-range">
          <div class="form-group">
            <label for="startDate">Start Date & Time</label>
            <input
              id="startDate"
              type="datetime-local"
              bind:value={localStartDate}
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="endDate">End Date & Time</label>
            <input
              id="endDate"
              type="datetime-local"
              bind:value={localEndDate}
              class="form-control"
            />
          </div>
        </div>
      {/if}

      <!-- 현재 날짜 범위 표시 -->
      {#if filters.dateRange}
        <div class="date-range-display">
          <div class="date-range-item">
            <span class="label">From:</span>
            <span class="value">{new Date(filters.dateRange.start).toLocaleString()}</span>
          </div>
          <div class="date-range-item">
            <span class="label">To:</span>
            <span class="value">{new Date(filters.dateRange.end).toLocaleString()}</span>
          </div>
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick={handleReset}>Reset All</button>
      <button class="btn btn-primary" onclick={handleApply}>Apply Filters</button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .btn-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background-color: #f0f0f0;
    color: #666;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    line-height: 1;
  }

  .btn-close:hover {
    background-color: #e0e0e0;
    color: #333;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e0e0e0;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.95rem;
    color: #444;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    color: #333;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .form-control:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  select.form-control {
    cursor: pointer;
  }

  .search-options {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.75rem;
    padding: 0 0.25rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #555;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .help-text {
    margin: 0.5rem 0 0 0;
    font-size: 0.85rem;
    color: #666;
  }

  .custom-date-range {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    background-color: rgba(52, 152, 219, 0.05);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .date-range-display {
    padding: 1rem;
    background-color: #e8f4f8;
    border-radius: 8px;
    margin-bottom: 1rem;
    border-left: 4px solid #3498db;
  }

  .date-range-item {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .date-range-item:last-child {
    margin-bottom: 0;
  }

  .date-range-item .label {
    font-weight: 600;
    color: #555;
    min-width: 50px;
  }

  .date-range-item .value {
    color: #2c3e50;
    font-family: 'Courier New', monospace;
  }

  .btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background-color: #3498db;
    color: white;
  }

  .btn-primary:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }

  .btn-secondary {
    background-color: #95a5a6;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #7f8c8d;
  }

  @media (prefers-color-scheme: dark) {
    .modal-content {
      background-color: #1a1a2e;
    }

    .modal-header {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .modal-header h2 {
      color: #f6f6f6;
    }

    .btn-close {
      background-color: rgba(255, 255, 255, 0.1);
      color: #ccc;
    }

    .btn-close:hover {
      background-color: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .modal-footer {
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    label {
      color: #ddd;
    }

    .form-control {
      background-color: #0f0f1e;
      color: #f6f6f6;
      border-color: #444;
    }

    .form-control:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .checkbox-label {
      color: #ccc;
    }

    .help-text {
      color: #999;
    }

    .custom-date-range {
      background-color: rgba(52, 152, 219, 0.1);
    }

    .date-range-display {
      background-color: rgba(52, 152, 219, 0.15);
      border-left-color: #5dade2;
    }

    .date-range-item .label {
      color: #aaa;
    }

    .date-range-item .value {
      color: #e8e8e8;
    }
  }

  @media (max-width: 640px) {
    .modal-content {
      max-height: 95vh;
    }

    .custom-date-range {
      grid-template-columns: 1fr;
    }

    .search-options {
      flex-direction: column;
      gap: 0.75rem;
    }
  }
</style>
