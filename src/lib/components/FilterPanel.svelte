<script>
  import { filters, parseTrid, DATE_PRESETS } from '../stores/filters.svelte.js';
  import { viewState } from '../stores/view.svelte.js';

  let tridInput = $state('');
  let tridParseError = $state('');
  let searchMode = $state('trid'); // 'trid' or 'detail'

  function handleTridInputChange() {
    tridParseError = '';
  }

  function handleTridSearch() {
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

    // TRID 검색 시 Detail 검색 쿼리 초기화 (독립적으로 작동)
    filters.setSearchQuery('');

    // Apply 와 동시에 결과 화면으로 전환
    viewState.showResults();
  }

  function handleDetailSearch() {
    // Detail 검색은 TRID 없이도 작동
    // TRID 검색 쿼리 초기화 (독립적으로 작동)
    filters.tridQuery = '';
    filters.save();

    // 필터가 이미 설정되어 있으므로 바로 검색 실행
    if (!filters.dateRange) {
      // 날짜 범위가 없으면 기본값 설정
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      filters.setStartDate(getLocalDateTimeString(oneHourAgo));
      filters.setEndDate(getLocalDateTimeString(now));
    }
    
    // 결과 화면으로 전환
    viewState.showResults();
  }

  function handleTridKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function handleDetailKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function switchMode(mode) {
    // 모드 전환 시 다른 모드의 검색 쿼리 초기화
    if (mode === 'trid') {
      filters.setSearchQuery('');
    } else {
      filters.tridQuery = '';
      filters.save();
      tridInput = '';
      tridParseError = '';
    }
    searchMode = mode;
  }

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
    filters.setStartDate(getLocalDateTimeString(oneHourAgo));
    filters.setEndDate(getLocalDateTimeString(now));
  }

  function handleDatePresetChange() {
    if (filters.datePreset === 'custom' && !filters.startDate && !filters.endDate) {
      setDefaultDateRange();
    }
  }

  function handleReset() {
    filters.reset();
    tridInput = '';
    tridParseError = '';
  }

  function handleSearch() {
    if (searchMode === 'trid') {
      handleTridSearch();
    } else {
      handleDetailSearch();
    }
  }
</script>

<div class="filter-panel">
  <!-- 모드 토글 -->
  <div class="mode-toggle">
    <button
      class="toggle-btn"
      class:active={searchMode === 'trid'}
      onclick={() => switchMode('trid')}
    >
      🔍 TRID Search
    </button>
    <button
      class="toggle-btn"
      class:active={searchMode === 'detail'}
      onclick={() => switchMode('detail')}
    >
      ⚙️ Detail Filters
    </button>
  </div>

  <!-- TRID 섹션 -->
  {#if searchMode === 'trid'}
    <div class="section">
      <div class="trid-input-group">
        <input
          type="text"
          bind:value={tridInput}
          oninput={handleTridInputChange}
          onkeydown={handleTridKeyDown}
          placeholder="Enter TRID (e.g., 20251125091033515637)"
          class="trid-input"
        />
      </div>

      {#if tridParseError}
        <div class="error-message">
          <span class="error-icon">⚠</span>
          {tridParseError}
        </div>
      {/if}

      <div class="search-actions">
        <button class="btn btn-secondary" onclick={handleReset}>Reset</button>
        <button
          class="btn btn-primary"
          onclick={handleSearch}
          disabled={!tridInput.trim()}
        >
          Search
        </button>
      </div>
    </div>
  {/if}

  <!-- Detail Filters 섹션 -->
  {#if searchMode === 'detail'}
    <div class="section">
    <div class="section-header">
      <h3>⚙️ Detail Filters</h3>
    </div>

    <!-- 검색 쿼리 -->
    <div class="form-group">
      <label for="searchQuery">Search Query</label>
      <input
        id="searchQuery"
        type="text"
        value={filters.searchQuery}
        oninput={(e) => filters.setSearchQuery(e.target.value)}
        onkeydown={handleDetailKeyDown}
        placeholder="Enter search text or pattern..."
        class="form-control"
      />
      <div class="search-options">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            checked={filters.caseSensitive}
            onchange={() => filters.toggleCaseSensitive()}
          />
          <span>Case Sensitive</span>
        </label>
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            checked={filters.useRegex}
            onchange={() => filters.toggleUseRegex()}
          />
          <span>Use Regex</span>
        </label>
      </div>
      <p class="help-text">
        {#if filters.useRegex}
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
        value={filters.datePreset}
        onchange={(e) => {
          filters.setDatePreset(e.target.value);
          handleDatePresetChange();
        }}
        class="form-control"
      >
        {#each DATE_PRESETS as preset}
          <option value={preset.value}>{preset.label}</option>
        {/each}
      </select>
    </div>

    <!-- 커스텀 날짜 범위 -->
    {#if filters.datePreset === 'custom'}
      <div class="custom-date-range">
        <div class="form-group">
          <label for="startDate">Start Date & Time</label>
          <input
            id="startDate"
            type="datetime-local"
            value={filters.startDate}
            oninput={(e) => filters.setStartDate(e.target.value)}
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="endDate">End Date & Time</label>
          <input
            id="endDate"
            type="datetime-local"
            value={filters.endDate}
            oninput={(e) => filters.setEndDate(e.target.value)}
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

      <!-- 검색 및 Reset 버튼 -->
      <div class="search-actions">
        <button class="btn btn-secondary" onclick={handleReset}>Reset</button>
        <button 
          class="btn btn-primary" 
          onclick={handleSearch}
          disabled={!filters.dateRange && filters.datePreset === 'custom' && (!filters.startDate || !filters.endDate)}
        >
          Search
        </button>
      </div>
    </div>
  {/if}
</div>

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

  .mode-toggle {
    display: flex;
    gap: 0.5rem;
    background-color: #f5f5f5;
    padding: 0.5rem;
    border-radius: 10px;
    margin-bottom: 0.5rem;
  }

  .toggle-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    background-color: transparent;
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .toggle-btn.active {
    background-color: white;
    color: #2c3e50;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
  
  .search-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .trid-input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
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
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
  }

  .btn-primary {
    background-color: #3498db;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: #95a5a6;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #7f8c8d;
    transform: translateY(-1px);
  }

  @media (prefers-color-scheme: dark) {
    .filter-panel {
      background-color: rgba(26, 26, 46, 0.95);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    h3 {
      color: #f6f6f6;
    }

    .mode-toggle {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .toggle-btn {
      color: #aaa;
    }

    .toggle-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .toggle-btn.active {
      background-color: rgba(255, 255, 255, 0.2);
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

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }
  }

  @media (max-width: 640px) {
    .filter-panel {
      padding: 1.5rem;
      max-width: 100%;
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
