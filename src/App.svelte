<script>
  const minEditorWidth = 440;
  const resizeHandleWidth = 4;

  export let business;

  const taxRate = 0.1;

  const createLineItem = (description = '', amount = 0) => ({
    id: crypto.randomUUID(),
    description,
    amount
  });

  const today = new Date();
  const defaultDueDate = new Date(today);
  defaultDueDate.setDate(defaultDueDate.getDate() + 7);
  const invoicePrefix = `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  let invoiceSuffix = '1';
  let issueDate = new Date().toISOString().slice(0, 10);
  let dueDate = defaultDueDate.toISOString().slice(0, 10);
  let includeGst = true;

  let billTo = {
    company: '',
    details: ''
  };

  let lineItems = [
    createLineItem('IT consulting services', 1200),
  ];
  let shellElement;
  let shellWidth = 0;
  let editorWidth = 460;
  let isResizing = false;
  let resizeGrabOffset = resizeHandleWidth / 2;

  const currency = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  });

  const longDate = new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  function formatCurrency(value) {
    return currency.format(Number(value) || 0);
  }

  function formatDate(value) {
    if (!value) return '';
    return longDate.format(new Date(`${value}T00:00:00`));
  }

  function numericValue(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatInvoiceSuffix(value) {
    const digits = String(value ?? '')
      .replace(/\D/g, '')
      .slice(0, 3);
    return digits || '1';
  }

  function displayInvoiceSuffix(value) {
    return formatInvoiceSuffix(value).padStart(3, '0');
  }

  function lineTotal(item) {
    return numericValue(item.amount);
  }

  $: subtotal = lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  $: gst = includeGst ? subtotal * taxRate : 0;
  $: total = subtotal + gst;
  $: invoiceSuffix = formatInvoiceSuffix(invoiceSuffix);
  $: invoiceNumber = `${invoicePrefix}${displayInvoiceSuffix(invoiceSuffix)}`;
  $: minPreviewWidth = shellWidth > 0 ? Math.min(320, Math.max(220, shellWidth * 0.35)) : 320;
  $: maxEditorWidth = shellWidth > 0 ? Math.max(minEditorWidth, shellWidth - minPreviewWidth - resizeHandleWidth) : 680;
  $: constrainedEditorWidth = Math.min(Math.max(editorWidth, minEditorWidth), maxEditorWidth);
  $: shellColumns =
    shellWidth && shellWidth > 1080
      ? `${constrainedEditorWidth}px ${resizeHandleWidth}px minmax(0, 1fr)`
      : '1fr';

  function addLineItem() {
    lineItems = [...lineItems, createLineItem('', 0)];
  }

  function removeLineItem(id) {
    if (lineItems.length === 1) return;
    lineItems = lineItems.filter((item) => item.id !== id);
  }

  function updateLineItem(id, field, value) {
    lineItems = lineItems.map((item) =>
      item.id === id
        ? {
            ...item,
            [field]: field === 'description' ? value : numericValue(value)
          }
        : item
    );
  }

  function printInvoice() {
    window.print();
  }

  function gridColumnGap() {
    if (!shellElement) return 0;
    return Number.parseFloat(getComputedStyle(shellElement).columnGap) || 0;
  }

  function startResize() {
    resizeGrabOffset = resizeHandleWidth / 2;
    isResizing = true;
  }

  function stopResize() {
    isResizing = false;
  }

  function resizePanels(event) {
    if (!isResizing || shellWidth <= 1080 || !shellElement) return;
    const { left } = shellElement.getBoundingClientRect();
    const pointerEditorWidth = event.clientX - left - gridColumnGap() - resizeGrabOffset;
    editorWidth = Math.min(Math.max(pointerEditorWidth, minEditorWidth), maxEditorWidth);
  }
</script>

<svelte:head>
  <title>Alkaid Invoice Generator</title>
  <meta
    name="description"
    content="Generate Australian tax invoices with editable bill-to details and invoice line items."
  />
</svelte:head>

<svelte:window on:pointermove={resizePanels} on:pointerup={stopResize} on:pointercancel={stopResize} />

<div
  bind:this={shellElement}
  class:resizing={isResizing}
  class="shell"
  bind:clientWidth={shellWidth}
  style={`grid-template-columns: ${shellColumns};`}
>
  <section class="panel controls">
    <div class="panel-header">
      <div>
        <h1>Alkaid Invoice Generator</h1>
        <p class="intro-copy">Update the customer details and charges, then export the finished tax invoice as a PDF.</p>
      </div>
      <button class="primary" on:click={printInvoice}>Export PDF</button>
    </div>

    <div class="section-copy">
      <p class="eyebrow">Invoice Number</p>
    </div>

    <div class="grid">
      <label>
        <span>Suffix</span>
        <input bind:value={invoiceSuffix} type="number" min="1" step="1" placeholder="1" />
      </label>
    </div>

    <div class="section-copy">
      <p class="eyebrow">Bill To</p>
    </div>

    <div class="grid">
      <label>
        <span>Company name</span>
        <input bind:value={billTo.company} placeholder="Client company" />
      </label>
      <label>
        <span>Other client details</span>
        <textarea
          bind:value={billTo.details}
          rows="6"
          placeholder={`Attn: Jane Smith\naccounts@example.com\nLevel 3, 200 George Street\nSydney NSW 2000\nAustralia`}
        ></textarea>
      </label>
    </div>

    <div class="section-copy">
      <p class="eyebrow">Line Items</p>
    </div>

    <label class="toggle-field">
      <span>Include GST</span>
      <input bind:checked={includeGst} type="checkbox" />
    </label>

    <div class="line-items-editor">
      {#each lineItems as item, index (item.id)}
        <div class="line-item-row">
          <label class="line-item-description">
            <span>Description</span>
            <input
              value={item.description}
              on:input={(event) => updateLineItem(item.id, 'description', event.currentTarget.value)}
              placeholder="Professional service"
            />
          </label>
          <label class="line-item-amount">
            <span>Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.amount}
              on:input={(event) => updateLineItem(item.id, 'amount', event.currentTarget.value)}
            />
          </label>
          <button
            class="ghost danger remove-line-item"
            type="button"
            on:click={() => removeLineItem(item.id)}
            disabled={lineItems.length === 1}
            aria-label={`Remove line item ${index + 1}`}
            title="Remove line item"
          >
            ×
          </button>
        </div>
      {/each}

      <button class="ghost" type="button" on:click={addLineItem}>Add line item</button>
    </div>
  </section>

  <button
    aria-label="Resize editor panel"
    class="resize-handle"
    on:pointerdown|preventDefault={startResize}
    type="button"
  >
    <span></span>
  </button>

  <section class="panel preview-panel">
    <div class="preview-frame invoice-sheet" id="invoice-sheet">
      <header class="invoice-header">
        <div class="invoice-title-block">
          <h2>Tax Invoice</h2>
          <div class="invoice-meta">
            <div>
              <span>Invoice Number</span>
              <span>{invoiceNumber}</span>
            </div>
            <div>
              <span>Invoice Date</span>
              <span>{formatDate(issueDate)}</span>
            </div>
            <div>
              <span>Due Date</span>
              <span>{formatDate(dueDate)}</span>
            </div>
            <div>
              <span>Amount Due</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        <p class="brand-mark">ALKAID TECHNOLOGIES</p>
      </header>

      <section class="address-grid">
        <div>
          <p class="mini-heading">From</p>
          <p class="stacked">
            <strong>{business.name}</strong><br />
            ABN {business.abn}<br />
            {#each business.address as line}
              {line}<br />
            {/each}
            {business.email}<br />
            {business.phone}
          </p>
        </div>
        <div>
          <p class="mini-heading">Bill to</p>
          <p class="stacked">
            <strong>{billTo.company || 'Client company'}</strong><br />
            {#if billTo.details.trim()}
              {#each billTo.details.split('\n') as line}
                {line}<br />
              {/each}
            {/if}
          </p>
        </div>
      </section>

      <section class="invoice-items-section">
        <p class="mini-heading">Details</p>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount-column">Amount (AUD)</th>
            </tr>
          </thead>
          <tbody>
            {#each lineItems as item}
              <tr>
                <td>{item.description || 'Invoice item'}</td>
                <td class="amount-column">{formatCurrency(lineTotal(item))}</td>
              </tr>
            {/each}
            {#if includeGst}
              <tr>
                <td>GST (10%)</td>
                <td class="amount-column">{formatCurrency(gst)}</td>
              </tr>
            {/if}
          </tbody>
          <tfoot>
            <tr class="grand-total">
              <td>Total Amount</td>
              <td class="amount-column">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section class="payment-section">
        <div class="payment-card">
          <p class="mini-heading">Payment Method</p>
          <div class="payment-info">
            <p>Please make payment via bank transfer to</p>
            {#if business.bankDetails.payid}
              <div>
                <span>PayID</span>
                <span>{business.bankDetails.payid}</span>
              </div>
              <p class="payment-divider">Or</p>
            {/if}
            <div>
              <span>BSB</span>
              <span>{business.bankDetails.bsb}</span>
            </div>
            <div>
              <span>Account Number</span>
              <span>{business.bankDetails.accountNumber}</span>
            </div>
            <div>
              <span>Account Name</span>
              <span>{business.bankDetails.accountName}</span>
            </div>
          </div>
          <p class="tax-note">Please quote your invoice number {invoiceNumber} as reference.</p>
        </div>
      </section>
    </div>
  </section>
</div>
