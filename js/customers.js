document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('customer-form');
  const customerIdInput = document.getElementById('customer-id');

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function clearForm() {
    form.reset();
    customerIdInput.value = '';
  }

  function showLoading(show) {
    const tbody = document.getElementById('customers-table-body');
    if (show) {
      tbody.innerHTML = `
        <tr id="loading-row">
          <td colspan="4" class="px-4 py-8 text-center">
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

  async function loadCustomers() {
    showLoading(true);
    try {
      const customers = await fetchAPI('/customers');
      const tbody = document.getElementById('customers-table-body');
      tbody.innerHTML = '';

      customers.forEach((customer) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="px-4 py-2 border">${escapeHtml(customer.name)}</td>
          <td class="px-4 py-2 border">${escapeHtml(customer.email)}</td>
          <td class="px-4 py-2 border">${escapeHtml(customer.phone ?? '')}</td>
          <td class="px-4 py-2 border space-x-2">
            <button
              class="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded edit-btn"
              data-id="${customer.id}"
              data-name="${escapeAttr(customer.name)}"
              data-email="${escapeAttr(customer.email)}"
              data-phone="${escapeAttr(customer.phone ?? '')}"
            >Editar</button>
            <button
              class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded delete-btn"
              data-id="${customer.id}"
            >Excluir</button>
            <a
              href="orders.html?customer_id=${customer.id}"
              class="inline-block px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >Pedidos</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      showToast('Erro ao carregar clientes: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  document.getElementById('customers-table-body').addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
      customerIdInput.value = editBtn.dataset.id;
      document.getElementById('customer-name').value = editBtn.dataset.name;
      document.getElementById('customer-email').value = editBtn.dataset.email;
      document.getElementById('customer-phone').value = editBtn.dataset.phone;
      return;
    }

    if (deleteBtn) {
      if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
      showLoading(true);
      try {
        await fetchAPI(`/customers/${deleteBtn.dataset.id}`, { method: 'DELETE' });
        showToast('Cliente excluído com sucesso.', 'success');
        await loadCustomers();
      } catch (err) {
        showToast('Erro ao excluir cliente: ' + err.message, 'error');
      } finally {
        showLoading(false);
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const id = customerIdInput.value;

    const body = { name, email };
    if (phone) body.phone = phone;

    showLoading(true);
    try {
      if (id) {
        await fetchAPI(`/customers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        showToast('Cliente atualizado com sucesso.', 'success');
      } else {
        await fetchAPI('/customers', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        showToast('Cliente cadastrado com sucesso.', 'success');
      }
      clearForm();
      await loadCustomers();
    } catch (err) {
      showToast('Erro ao salvar cliente: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  });

  loadCustomers();
});
