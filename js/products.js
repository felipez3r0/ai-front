document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('product-form');
  const productIdInput = document.getElementById('product-id');
  const messageDiv = document.getElementById('message');

  let messageTimer = null;

  function showMessage(text, isError = false) {
    clearTimeout(messageTimer);
    messageDiv.textContent = text;
    messageDiv.className = isError
      ? 'p-3 rounded text-white bg-red-500'
      : 'p-3 rounded text-white bg-green-500';
    messageDiv.classList.remove('hidden');
    messageTimer = setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 4000);
  }

  function formatPrice(value) {
    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  }

  function clearForm() {
    form.reset();
    productIdInput.value = '';
  }

  function showLoading(show) {
    const tbody = document.getElementById('products-table-body');
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

  async function loadProducts() {
    showLoading(true);
    try {
      const products = await fetchAPI('/products');
      const tbody = document.getElementById('products-table-body');
      tbody.innerHTML = '';

      products.forEach((product) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="px-4 py-2 border">${escapeHtml(product.name)}</td>
          <td class="px-4 py-2 border">${formatPrice(product.price)}</td>
          <td class="px-4 py-2 border">${escapeHtml(product.description ?? '')}</td>
          <td class="px-4 py-2 border space-x-2">
            <button
              class="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded edit-btn"
              data-id="${product.id}"
              data-name="${escapeAttr(product.name)}"
              data-description="${escapeAttr(product.description ?? '')}"
              data-price="${product.price}"
            >Editar</button>
            <button
              class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded delete-btn"
              data-id="${product.id}"
            >Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      showMessage('Erro ao carregar produtos: ' + err.message, true);
    } finally {
      showLoading(false);
    }
  }

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

  document.getElementById('products-table-body').addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
      productIdInput.value = editBtn.dataset.id;
      document.getElementById('product-name').value = editBtn.dataset.name;
      document.getElementById('product-description').value = editBtn.dataset.description;
      document.getElementById('product-price').value = editBtn.dataset.price;
      return;
    }

    if (deleteBtn) {
      if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
      showLoading(true);
      try {
        await fetchAPI(`/products/${deleteBtn.dataset.id}`, { method: 'DELETE' });
        showMessage('Produto excluído com sucesso.');
        await loadProducts();
      } catch (err) {
        showMessage('Erro ao excluir produto: ' + err.message, true);
      } finally {
        showLoading(false);
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const id = productIdInput.value;

    const body = { name, price };
    if (description) body.description = description;

    showLoading(true);
    try {
      if (id) {
        await fetchAPI(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        showMessage('Produto atualizado com sucesso.');
      } else {
        await fetchAPI('/products', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        showMessage('Produto cadastrado com sucesso.');
      }
      clearForm();
      await loadProducts();
    } catch (err) {
      showMessage('Erro ao salvar produto: ' + err.message, true);
    } finally {
      showLoading(false);
    }
  });

  loadProducts();
});
