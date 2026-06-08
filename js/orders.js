document.addEventListener('DOMContentLoaded', () => {
  const formContainer = document.getElementById('form-container');
  const toggleFormBtn = document.getElementById('toggle-form-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const orderForm = document.getElementById('order-form');
  const customerSelect = document.getElementById('order-customer');
  const itemsContainer = document.getElementById('items-container');
  const addItemBtn = document.getElementById('add-item-btn');
  const orderDetail = document.getElementById('order-detail');
  const orderDetailContent = document.getElementById('order-detail-content');
  const closeDetailBtn = document.getElementById('close-detail-btn');

  let products = [];

  // ── Utilitários ─────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatCurrency(value) {
    return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function showLoading(show) {
    const tbody = document.getElementById('orders-table-body');
    if (show) {
      tbody.innerHTML = `
        <tr id="loading-row">
          <td colspan="5" class="px-4 py-8 text-center">
            <div class="flex justify-center">
              <div class="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-8 w-8"></div>
            </div>
          </td>
        </tr>`;
    } else {
      const loadingRow = tbody.querySelector('#loading-row');
      if (loadingRow) loadingRow.remove();
    }
  }

  // ── Itens do formulário ──────────────────────────────────────────────────────

  function buildProductOptions() {
    return products
      .map(
        (p) =>
          `<option value="${p.id}">${escapeHtml(p.name)} — R$ ${formatCurrency(p.price)}</option>`
      )
      .join('');
  }

  function addItemRow() {
    const row = document.createElement('div');
    row.className = 'item-row flex gap-2 items-center';
    row.innerHTML = `
      <select class="item-product flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
        ${buildProductOptions()}
      </select>
      <input
        type="number"
        min="1"
        value="1"
        class="item-qty w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Qtd"
      />
      <button
        type="button"
        class="remove-item-btn px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg"
      >Remover</button>
    `;
    itemsContainer.appendChild(row);
  }

  itemsContainer.addEventListener('click', (e) => {
    if (e.target.closest('.remove-item-btn')) {
      const row = e.target.closest('.item-row');
      if (itemsContainer.querySelectorAll('.item-row').length > 1) {
        row.remove();
      } else {
        showToast('O pedido deve ter pelo menos um item.', 'error');
      }
    }
  });

  addItemBtn.addEventListener('click', addItemRow);

  // ── Abrir / fechar formulário ────────────────────────────────────────────────

  async function openForm() {
    formContainer.classList.remove('hidden');
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await loadFormData();
  }

  function closeForm() {
    formContainer.classList.add('hidden');
    orderForm.reset();
    itemsContainer.innerHTML = '';
  }

  toggleFormBtn.addEventListener('click', () => {
    if (formContainer.classList.contains('hidden')) {
      openForm();
    } else {
      closeForm();
    }
  });

  cancelBtn.addEventListener('click', closeForm);

  // ── Carregar clientes e produtos para o formulário ───────────────────────────

  async function loadFormData() {
    try {
      const [customers, fetchedProducts] = await Promise.all([
        fetchAPI('/customers'),
        fetchAPI('/products'),
      ]);

      products = fetchedProducts;

      // Preenche select de clientes
      customerSelect.innerHTML = '<option value="">Selecione um cliente</option>';
      customers.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name} — ${c.email}`;
        customerSelect.appendChild(opt);
      });

      // Funcionalidade 4: pré-selecionar cliente via query string
      const params = new URLSearchParams(window.location.search);
      const preselect = params.get('customer_id');
      if (preselect) {
        customerSelect.value = preselect;
      }

      // Inicializa com 1 linha de item
      itemsContainer.innerHTML = '';
      addItemRow();
    } catch (err) {
      showToast('Erro ao carregar dados do formulário: ' + err.message, 'error');
    }
  }

  // ── Submissão do formulário ──────────────────────────────────────────────────

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const customerId = Number(customerSelect.value);
    if (!customerId) {
      showToast('Selecione um cliente.', 'error');
      return;
    }

    const rows = itemsContainer.querySelectorAll('.item-row');
    if (rows.length === 0) {
      showToast('Adicione pelo menos um item ao pedido.', 'error');
      return;
    }

    const items = [];
    let valid = true;

    rows.forEach((row) => {
      const productId = Number(row.querySelector('.item-product').value);
      const quantity = Number(row.querySelector('.item-qty').value);

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        valid = false;
      } else {
        items.push({ product_id: productId, quantity });
      }
    });

    if (!valid) {
      showToast('Verifique os itens: produto e quantidade (inteiro ≥ 1) são obrigatórios.', 'error');
      return;
    }

    showLoading(true);
    try {
      await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify({ customer_id: customerId, items }),
      });
      showToast('Pedido criado com sucesso.', 'success');
      closeForm();
      await loadOrders();
    } catch (err) {
      showToast('Erro ao criar pedido: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  });

  // ── Listagem de pedidos ──────────────────────────────────────────────────────

  async function loadOrders() {
    showLoading(true);
    try {
      const orders = await fetchAPI('/orders');
      const tbody = document.getElementById('orders-table-body');
      tbody.innerHTML = '';

      if (orders.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="px-4 py-6 text-center text-gray-400">Nenhum pedido encontrado.</td></tr>';
        return;
      }

      orders.forEach((order) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="px-4 py-2 border-b border-gray-100">${escapeHtml(order.id)}</td>
          <td class="px-4 py-2 border-b border-gray-100">${escapeHtml(order.customer_id)}</td>
          <td class="px-4 py-2 border-b border-gray-100">R$ ${formatCurrency(order.total)}</td>
          <td class="px-4 py-2 border-b border-gray-100">${formatDate(order.created_at)}</td>
          <td class="px-4 py-2 border-b border-gray-100">
            <button
              class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded detail-btn"
              data-id="${order.id}"
            >Ver Detalhe</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      showToast('Erro ao carregar pedidos: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  // ── Detalhe do pedido ────────────────────────────────────────────────────────

  document.getElementById('orders-table-body').addEventListener('click', async (e) => {
    const btn = e.target.closest('.detail-btn');
    if (!btn) return;

    showLoading(true);
    try {
      const order = await fetchAPI(`/orders/${btn.dataset.id}`);
      renderDetail(order);
      orderDetail.classList.remove('hidden');
      orderDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showToast('Erro ao carregar detalhe do pedido: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  });

  closeDetailBtn.addEventListener('click', () => {
    orderDetail.classList.add('hidden');
    orderDetailContent.innerHTML = '';
  });

  function renderDetail(order) {
    const items = order.items ?? [];

    const itemRows = items
      .map((item) => {
        const subtotal = item.unit_price * item.quantity;
        return `
          <tr>
            <td class="px-4 py-2 border-b border-gray-100">${escapeHtml(item.product_id)}</td>
            <td class="px-4 py-2 border-b border-gray-100">${escapeHtml(item.quantity)}</td>
            <td class="px-4 py-2 border-b border-gray-100">R$ ${formatCurrency(item.unit_price)}</td>
            <td class="px-4 py-2 border-b border-gray-100">R$ ${formatCurrency(subtotal)}</td>
          </tr>
        `;
      })
      .join('');

    orderDetailContent.innerHTML = `
      <dl class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
        <div>
          <dt class="text-xs uppercase text-gray-400 font-medium">ID</dt>
          <dd class="text-gray-700 font-semibold">${escapeHtml(order.id)}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase text-gray-400 font-medium">Cliente</dt>
          <dd class="text-gray-700 font-semibold">${escapeHtml(order.customer_id)}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase text-gray-400 font-medium">Total</dt>
          <dd class="text-gray-700 font-semibold">R$ ${formatCurrency(order.total)}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase text-gray-400 font-medium">Data</dt>
          <dd class="text-gray-700 font-semibold">${formatDate(order.created_at)}</dd>
        </div>
      </dl>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-gray-700">
          <thead class="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
            <tr>
              <th class="px-4 py-3 text-left">Produto</th>
              <th class="px-4 py-3 text-left">Qtd</th>
              <th class="px-4 py-3 text-left">Preço Unit. (R$)</th>
              <th class="px-4 py-3 text-left">Subtotal (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows || '<tr><td colspan="4" class="px-4 py-4 text-center text-gray-400">Sem itens.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  // ── Inicialização ────────────────────────────────────────────────────────────

  // Se vier ?customer_id na URL, abre o formulário automaticamente
  const params = new URLSearchParams(window.location.search);
  if (params.get('customer_id')) {
    openForm();
  }

  loadOrders();
});
