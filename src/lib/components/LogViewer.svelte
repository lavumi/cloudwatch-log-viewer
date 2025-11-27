<script>
  import { invoke } from '@tauri-apps/api/core';
  import { logGroups } from '../stores/logGroups.svelte.js';
  import { filters } from '../stores/filters.svelte.js';
  import { onMount } from 'svelte';

  let logs = $state([]);
  let isLoading = $state(false);
  let error = $state('');
  let totalLogs = $state(0);

  // 로그 레벨 필터
  let showError = $state(true);
  let showWarn = $state(true);
  let showInfo = $state(true);
  let showDebug = $state(true);
  let showTrace = $state(true);

  // 필터링된 로그
  let filteredLogs = $derived.by(() => {
    return logs.filter(log => {
      const parsed = parseLogMessage(log.message);
      const level = parsed.level?.toUpperCase();

      if (level === 'ERROR' && !showError) return false;
      if (level === 'WARN' && !showWarn) return false;
      if (level === 'INFO' && !showInfo) return false;
      if (level === 'DEBUG' && !showDebug) return false;
      if (level === 'TRACE' && !showTrace) return false;

      return true;
    });
  });

  async function fetchLogs() {
    const activeGroup = logGroups.activeGroup;
    if (!activeGroup) {
      error = 'Please select a log group first';
      return;
    }

    if (!filters.dateRange) {
      error = 'Please select a valid time range';
      return;
    }

    isLoading = true;
    error = '';
    logs = [];

    try {
      const request = {
        region: activeGroup.region,
        log_group: activeGroup.name,
        start_time: filters.dateRange.start,
        end_time: filters.dateRange.end,
        filter_pattern: filters.cloudWatchPattern || null,
      };

      console.log('Fetching logs with request:', request);
      console.log('Start time:', new Date(request.start_time).toISOString());
      console.log('End time:', new Date(request.end_time).toISOString());

      const response = await invoke('fetch_logs', { request });

      console.log('Response:', response);
      console.log('Events count:', response.events?.length);

      if (response.error) {
        error = response.error;
      } else {
        logs = response.events || [];
        totalLogs = logs.length;

        if (logs.length === 0) {
          error = 'No logs found for the specified criteria. Check your region, log group, and time range.';
        }
      }
    } catch (e) {
      error = `Failed to fetch logs: ${String(e)}`;
      console.error('Error fetching logs:', e);
      console.error('Error details:', JSON.stringify(e, null, 2));
    } finally {
      isLoading = false;
    }
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  function getLogLevelIcon(level) {
    switch(level?.toUpperCase()) {
      case 'ERROR': return '❌';
      case 'WARN': return '⚠️';
      case 'INFO': return 'ℹ️';
      case 'DEBUG': return '🔧';
      case 'TRACE': return '🔍';
      default: return '•';
    }
  }

  function parseLogMessage(message) {
    try {
      const parsed = JSON.parse(message);

      // 특별 필드 추출
      const trid = parsed.trid || '-';
      const level = parsed.l || null;
      const caller = parsed.caller || '-';

      // 필터링할 필드들 제거
      const filtered = { ...parsed };
      delete filtered.time;
      delete filtered.stream;
      delete filtered._p;
      delete filtered.l;
      delete filtered.t;
      delete filtered.kubernetes;
      delete filtered.trid;
      delete filtered.caller;

      // 남은 내용을 보기 좋게 포맷
      const remaining = JSON.stringify(filtered, null, 2);

      return {
        level: level,
        trid: trid,
        caller: caller,
        msg: remaining,
        raw: message
      };
    } catch {
      return {
        level: null,
        trid: '-',
        caller: '-',
        msg: message,
        raw: message
      };
    }
  }

  function highlightSearchQuery(message) {
    if (!filters.searchQuery || filters.useRegex) {
      return message;
    }

    const query = filters.searchQuery;
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      filters.caseSensitive ? 'g' : 'gi'
    );

    return message.replace(regex, '<mark>$1</mark>');
  }

  // 컴포넌트가 마운트되면 자동으로 로그 fetch
  onMount(() => {
    fetchLogs();
  });
</script>

<div class="log-viewer">
  {#if !isLoading && logs.length > 0}
    <div class="filter-bar">
      <label class="filter-checkbox">
        <input type="checkbox" bind:checked={showError} />
        <span>❌ ERROR</span>
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" bind:checked={showWarn} />
        <span>⚠️ WARN</span>
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" bind:checked={showInfo} />
        <span>ℹ️ INFO</span>
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" bind:checked={showDebug} />
        <span>🔧 DEBUG</span>
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" bind:checked={showTrace} />
        <span>🔍 TRACE</span>
      </label>
      <span class="log-count">{filteredLogs.length} / {logs.length}</span>
    </div>
  {/if}

  {#if error}
    <div class="error-message">
      <span class="error-icon">✕</span>
      <span>{error}</span>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Fetching logs from CloudWatch...</p>
    </div>
  {/if}

  {#if !isLoading && logs.length === 0 && !error}
    <div class="empty-state">
      <div class="empty-icon">📋</div>
      <p>No logs found</p>
    </div>
  {/if}

  {#if !isLoading && logs.length > 0}
    <div class="logs-container">
      {#each filteredLogs as log (log.timestamp + log.message)}
        {@const parsed = parseLogMessage(log.message)}
        <div class="log-entry">
          <span class="log-level">{getLogLevelIcon(parsed.level)}</span>
          <span class="log-timestamp">{formatTimestamp(log.timestamp)}</span>
          <span class="log-trid">{parsed.trid}</span>
          <span class="log-caller">{parsed.caller}</span>
          <span class="log-message">{@html highlightSearchQuery(parsed.msg)}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .log-viewer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background-color: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    font-size: 0.85rem;
  }

  .filter-checkbox {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    user-select: none;
  }

  .filter-checkbox input[type="checkbox"] {
    cursor: pointer;
  }

  .filter-checkbox span {
    color: #555;
  }

  .log-count {
    margin-left: auto;
    color: #7f8c8d;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .error-message {
    padding: 1rem;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    color: #c33;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .error-icon {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(52, 152, 219, 0.2);
    border-top-color: #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-state p {
    margin: 0;
    color: #666;
    font-size: 1.1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 0.5rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state p {
    margin: 0;
    color: #666;
    font-size: 1.1rem;
  }

  .logs-container {
    flex: 1;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .log-entry {
    display: block;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: background-color 0.15s;
  }

  .log-entry:hover {
    background-color: rgba(52, 152, 219, 0.08);
  }

  .log-level {
    display: inline-block;
    margin-right: 0.5rem;
    min-width: 20px;
    text-align: center;
  }

  .log-timestamp {
    display: inline-block;
    color: #7f8c8d;
    margin-right: 1rem;
    min-width: 100px;
  }

  .log-trid {
    display: inline-block;
    color: #3498db;
    margin-right: 1rem;
    min-width: 180px;
    font-weight: 500;
  }

  .log-caller {
    display: inline-block;
    color: #e67e22;
    margin-right: 1rem;
    min-width: 200px;
    font-weight: 400;
  }

  .log-message {
    display: inline;
    color: #2c3e50;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .log-message :global(mark) {
    background-color: #fff176;
    padding: 0.1rem 0.2rem;
    border-radius: 2px;
    font-weight: 600;
  }

  @media (prefers-color-scheme: dark) {
    .filter-bar {
      background-color: rgba(255, 255, 255, 0.02);
      border-bottom-color: rgba(255, 255, 255, 0.05);
    }

    .filter-checkbox span {
      color: #ccc;
    }

    .log-count {
      color: #95a5a6;
    }

    .error-message {
      background-color: rgba(231, 76, 60, 0.2);
      border-color: #e74c3c;
      color: #ff6b6b;
    }

    .loading-state p,
    .empty-state p {
      color: #ccc;
    }

    .log-entry {
      border-bottom-color: rgba(255, 255, 255, 0.05);
    }

    .log-entry:hover {
      background-color: rgba(52, 152, 219, 0.12);
    }

    .log-timestamp {
      color: #95a5a6;
    }

    .log-trid {
      color: #5dade2;
    }

    .log-caller {
      color: #f39c12;
    }

    .log-message {
      color: #ecf0f1;
    }

    .log-message :global(mark) {
      background-color: rgba(255, 241, 118, 0.3);
      color: #fff176;
    }
  }
</style>
