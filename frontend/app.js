const apiUrl = 'http://localhost:3000/productos';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    const categorySelect = document.getElementById('category');
    const sizeSelect = document.getElementById('size');
    const searchInput = document.getElementById('search');
    const inventoryTable = document.getElementById('inventory').querySelector('tbody');

    const sizes = {
        "Camiseta": ["XS", "S", "M", "L", "XL"],
        "Blusa": ["XS", "S", "M", "L", "XL"],
        "Ropa Interior": ["XS", "S", "M", "L", "XL"],
        "Jean Femenino": ["4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24"],
        "Jean Masculino": ["28", "30", "32", "34", "36", "38", "40", "42", "44"],
        "Pantalon": ["XS", "S", "M", "L", "XL"],
        "Accesorios": ["No aplica"],
        "Calzado": ["22", "24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44"]
    };

    // Actualizar tallas al cambiar categoría
    categorySelect.addEventListener('change', () => {
        sizeSelect.innerHTML = '';
        sizes[categorySelect.value].forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });
    });

    // Enviar formulario de producto
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        try {
            await fetch(apiUrl, { method: 'POST', body: data });
            alert('Producto agregado correctamente.');
            form.reset();
            loadInventory();
        } catch (error) {
            console.error('Error al agregar producto:', error);
            alert('Hubo un error al agregar el producto.');
        }
    });

    // Buscar productos
    searchInput.addEventListener('input', () => loadInventory(searchInput.value));

    // Cargar inventario
    async function loadInventory(query = '') {
        try {
            const response = await fetch(`${apiUrl}?nombre=${query}`);
            const products = await response.json();
            inventoryTable.innerHTML = '';
            products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td><img src="${product.foto}" alt="${product.nombre}" style="width: 100px; height: auto;"></td>
            <td>${product.nombre}</td>
            <td>${product.categoria}</td>
            <td>${product.talla}</td>
            <td>${product.precio}</td>
            <td>${product.cantidad}</td>
    <td>
        <button onclick="updateProduct('${product._id}')">Editar</button>
        <button onclick="deleteProduct('${product._id}')">Eliminar</button>
    </td>
`;
                inventoryTable.appendChild(row);
            });
        } catch (error) {
            console.error('Error al cargar inventario:', error);
            alert('No se pudo cargar el inventario.');
        }
    }

    // Eliminar producto
    window.deleteProduct = async (id) => {
        try {
            await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
            alert('Producto eliminado correctamente.');
            loadInventory();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Hubo un error al eliminar el producto.');
        }
    };

    // Cargar inventario inicial
    loadInventory();
});
