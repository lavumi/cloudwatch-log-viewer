<script>
  import { logGroups } from '$lib/stores/logGroups.svelte.js';
  import { viewState } from '$lib/stores/view.svelte.js';

  let showAddForm = $state(false);
  let newGroupName = $state('');
  let newGroupAlias = $state('');
  let newGroupRegion = $state('ap-northeast-2');
  let editingId = $state(null);
  let editingAlias = $state('');

  function autofocus(node) {
    node.focus();
    return {};
  }

  function handleAddLogGroup() {
    if (newGroupName.trim()) {
      logGroups.add(newGroupName.trim(), newGroupRegion, newGroupAlias.trim());
      newGroupName = '';
      newGroupAlias = '';
      showAddForm = false;
    }
  }

  function handleDeleteLogGroup(id, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Tauri 환경에서 window.confirm이 제대로 작동하지 않으므로 바로 삭제
    // (필요시 Tauri dialog plugin을 사용하여 네이티브 다이얼로그로 대체 가능)
    logGroups.remove(id);
  }

  function handleSelectLogGroup(group) {
    logGroups.setActive(group.id);
  }

  function startEditAlias(group, e) {
    e.stopPropagation();
    editingId = group.id;
    editingAlias = group.alias || '';
  }

  function saveAlias(id) {
    logGroups.updateAlias(id, editingAlias.trim());
    editingId = null;
    editingAlias = '';
  }

  function cancelEdit() {
    editingId = null;
    editingAlias = '';
  }

  function handleBack() {
    viewState.showSearch();
  }
</script>

<aside class="sidebar">
  {#if viewState.isResultsView}
    <div class="back-button-container">
      <button class="btn-back" onclick={handleBack} title="뒤로 가기">
        ← Back to Search
      </button>
    </div>
  {/if}

  <div class="sidebar-header">
    <h2>Log Groups</h2>
    <button
      class="btn-add"
      onclick={() => showAddForm = !showAddForm}
      title="로그 그룹 추가"
    >
      +
    </button>
  </div>

  {#if showAddForm}
    <div class="add-form">
      <input
        type="text"
        bind:value={newGroupAlias}
        placeholder="별명 (선택사항)"
        class="form-input"
      />
      <input
        type="text"
        bind:value={newGroupName}
        placeholder="/aws/lambda/my-function"
        class="form-input"
        onkeydown={(e) => e.key === 'Enter' && handleAddLogGroup()}
      />
      <select bind:value={newGroupRegion} class="form-select">
        <option value="ap-northeast-2">Seoul</option>
        <option value="us-east-1">N. Virginia</option>
        <option value="us-west-2">Oregon</option>
        <option value="ap-northeast-1">Tokyo</option>
      </select>
      <div class="form-buttons">
        <button class="btn-save" onclick={handleAddLogGroup}>저장</button>
        <button class="btn-cancel" onclick={() => { showAddForm = false; newGroupName = ''; newGroupAlias = ''; }}>취소</button>
      </div>
    </div>
  {/if}

  <div class="log-groups-list">
    {#each logGroups.list as group (group.id)}
      <div
        class="log-group-item"
        class:active={group.id === logGroups.activeId}
        role="button"
        tabindex="0"
        onclick={(e) => {
          // 삭제 버튼이나 편집 폼 클릭 시에는 선택하지 않음
          if (e.target.closest('.btn-delete') || e.target.closest('.alias-edit-form')) {
            return;
          }
          handleSelectLogGroup(group);
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!e.target.closest('.btn-delete') && !e.target.closest('.alias-edit-form')) {
              handleSelectLogGroup(group);
            }
          }
        }}
      >
        <div class="group-info">
          {#if editingId === group.id}
            <div class="alias-edit-form" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
              <input
                type="text"
                bind:value={editingAlias}
                placeholder="별명 입력"
                class="alias-input"
                onkeydown={(e) => {
                  if (e.key === 'Enter') saveAlias(group.id);
                  if (e.key === 'Escape') cancelEdit();
                }}
                use:autofocus
              />
              <div class="alias-buttons">
                <button class="btn-alias-save" onclick={() => saveAlias(group.id)}>✓</button>
                <button class="btn-alias-cancel" onclick={cancelEdit}>✕</button>
              </div>
            </div>
          {:else}
            <div class="group-name" role="button" tabindex="0" ondblclick={(e) => startEditAlias(group, e)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { startEditAlias(group, e); } }}>
              {#if group.alias}
                <span class="alias">{group.alias}</span>
                <span class="real-name">{group.name}</span>
              {:else}
                {group.name}
              {/if}
            </div>
            <div class="group-region">{group.region}</div>
          {/if}
        </div>
        <button
          type="button"
          class="btn-delete"
          onclick={(e) => {
            console.log('Delete button onclick fired, calling handleDeleteLogGroup with id:', group.id);
            handleDeleteLogGroup(group.id, e);
          }}
          onmousedown={(e) => {
            e.stopPropagation();
          }}
          title="삭제"
        >
          ×
        </button>
      </div>
    {:else}
      <div class="empty-state">
        <p>저장된 로그 그룹이 없습니다.</p>
        <p class="hint">+ 버튼을 눌러 추가하세요</p>
      </div>
    {/each}
  </div>
</aside>

<style>
  .sidebar {
    width: 280px;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.95);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  }

  .sidebar-header {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .back-button-container {
    padding: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    background-color: rgba(52, 152, 219, 0.05);
  }

  .btn-back {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-back:hover {
    background-color: #2980b9;
    transform: translateX(-2px);
  }

  .btn-add {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .btn-add:hover {
    background-color: #2980b9;
    transform: scale(1.1);
  }

  .add-form {
    padding: 1rem;
    background-color: rgba(52, 152, 219, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .form-input,
  .form-select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #3498db;
  }

  .form-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .btn-save,
  .btn-cancel {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .btn-save {
    background-color: #3498db;
    color: white;
  }

  .btn-save:hover {
    background-color: #2980b9;
  }

  .btn-cancel {
    background-color: #95a5a6;
    color: white;
  }

  .btn-cancel:hover {
    background-color: #7f8c8d;
  }

  .log-groups-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .log-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .log-group-item:hover {
    background-color: rgba(52, 152, 219, 0.1);
    border-color: #3498db;
  }

  .log-group-item.active {
    background-color: #3498db;
    border-color: #3498db;
    color: white;
  }

  .group-info {
    flex: 1;
    overflow: hidden;
  }

  .group-name {
    font-weight: 500;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .alias {
    display: block;
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.1rem;
  }

  .real-name {
    display: block;
    font-size: 0.75rem;
    opacity: 0.7;
    font-weight: 400;
  }

  .log-group-item.active .real-name {
    opacity: 0.85;
  }

  .group-region {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 0.25rem;
  }

  .log-group-item.active .group-region {
    opacity: 0.9;
  }

  .alias-edit-form {
    width: 100%;
  }

  .alias-input {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid #3498db;
    border-radius: 4px;
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
    box-sizing: border-box;
  }

  .alias-input:focus {
    outline: none;
    border-color: #2980b9;
  }

  .alias-buttons {
    display: flex;
    gap: 0.4rem;
  }

  .btn-alias-save,
  .btn-alias-cancel {
    flex: 1;
    padding: 0.3rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .btn-alias-save {
    background-color: #27ae60;
    color: white;
  }

  .btn-alias-save:hover {
    background-color: #229954;
  }

  .btn-alias-cancel {
    background-color: #95a5a6;
    color: white;
  }

  .btn-alias-cancel:hover {
    background-color: #7f8c8d;
  }

  .btn-delete {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    margin-left: 0.5rem;
    position: relative;
    z-index: 10;
    flex-shrink: 0;
  }

  .btn-delete:hover {
    background-color: #e74c3c;
    color: white;
    transform: scale(1.1);
  }

  .log-group-item.active .btn-delete {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .log-group-item.active .btn-delete:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #7f8c8d;
  }

  .empty-state p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }

  .empty-state .hint {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  @media (prefers-color-scheme: dark) {
    .sidebar {
      background-color: rgba(26, 26, 46, 0.95);
      border-right-color: rgba(255, 255, 255, 0.1);
    }

    .sidebar-header {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .sidebar-header h2 {
      color: #f6f6f6;
    }

    .back-button-container {
      border-bottom-color: rgba(255, 255, 255, 0.1);
      background-color: rgba(52, 152, 219, 0.1);
    }

    .add-form {
      background-color: rgba(52, 152, 219, 0.1);
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .form-input,
    .form-select {
      background-color: #1a1a1a;
      color: #f6f6f6;
      border-color: #444;
    }

    .log-group-item {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.05);
      color: #f6f6f6;
    }

    .log-group-item:hover {
      background-color: rgba(52, 152, 219, 0.2);
    }

    .alias-input {
      background-color: #1a1a1a;
      color: #f6f6f6;
      border-color: #3498db;
    }

    .empty-state {
      color: #b0bec5;
    }
  }
</style>
