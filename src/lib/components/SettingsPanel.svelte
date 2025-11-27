<script>
  import { settings, AWS_REGIONS } from '../stores/settings.svelte.js';

  let localRegion = $state(settings.region);
  let localLogGroup = $state(settings.logGroup);

  function handleSave() {
    settings.setRegion(localRegion);
    settings.setLogGroup(localLogGroup);
  }

  function handleReset() {
    localRegion = settings.region;
    localLogGroup = settings.logGroup;
  }

  $effect(() => {
    localRegion = settings.region;
    localLogGroup = settings.logGroup;
  });
</script>

<div class="settings-panel">
  <h2>CloudWatch Log Settings</h2>

  <div class="form-group">
    <label for="region">
      AWS Region
      <span class="required">*</span>
    </label>
    <select
      id="region"
      bind:value={localRegion}
      class="form-control"
    >
      {#each AWS_REGIONS as region}
        <option value={region.value}>
          {region.label}
        </option>
      {/each}
    </select>
    <p class="help-text">Select the AWS region where your log group is located</p>
  </div>

  <div class="form-group">
    <label for="logGroup">
      Log Group Name
      <span class="required">*</span>
    </label>
    <input
      id="logGroup"
      type="text"
      bind:value={localLogGroup}
      placeholder="/aws/lambda/my-function"
      class="form-control"
    />
    <p class="help-text">Enter the full log group name (e.g., /aws/lambda/my-function)</p>
  </div>

  <div class="button-group">
    <button
      class="btn btn-primary"
      onclick={handleSave}
      disabled={!localRegion || !localLogGroup}
    >
      Save Settings
    </button>
    <button
      class="btn btn-secondary"
      onclick={handleReset}
    >
      Reset
    </button>
  </div>

  {#if settings.isConfigured}
    <div class="status-indicator success">
      <span class="status-icon">✓</span>
      Configuration saved
    </div>
  {:else}
    <div class="status-indicator warning">
      <span class="status-icon">⚠</span>
      Please configure settings before viewing logs
    </div>
  {/if}
</div>

<style>
  .settings-panel {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
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

  .required {
    color: #e74c3c;
    margin-left: 0.25rem;
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

  .help-text {
    margin: 0.5rem 0 0 0;
    font-size: 0.85rem;
    color: #666;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
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

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-secondary {
    background-color: #95a5a6;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #7f8c8d;
  }

  .status-indicator {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .status-icon {
    font-size: 1.25rem;
  }

  .status-indicator.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .status-indicator.warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }

  @media (prefers-color-scheme: dark) {
    .settings-panel {
      background-color: rgba(255, 255, 255, 0.05);
    }

    h2 {
      color: #f6f6f6;
    }

    label {
      color: #ddd;
    }

    .form-control {
      background-color: #1a1a1a;
      color: #f6f6f6;
      border-color: #444;
    }

    .form-control:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .help-text {
      color: #999;
    }

    .status-indicator.success {
      background-color: rgba(39, 174, 96, 0.2);
      color: #2ecc71;
      border-color: #27ae60;
    }

    .status-indicator.warning {
      background-color: rgba(241, 196, 15, 0.2);
      color: #f1c40f;
      border-color: #f39c12;
    }
  }

  @media (max-width: 640px) {
    .settings-panel {
      padding: 1.5rem;
    }

    .button-group {
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }
  }
</style>
