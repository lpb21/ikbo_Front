import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import ActAgrProductos  from './components/actAgrProductos';
import EliminarCantidadProducto from './components/eliminarProductos';

const ConsultarInventario = () => {
  const [inventario, setInventario] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedCodigo, setSelectedCodigo] = useState(null);
  const [newProducto, setNewProducto] = useState({ Nombres: '', Descripcion: '', CantidadRestante: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    //fetchInventario();
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/v1/getTablaProductoVencidoSP');
      setProductos(response.data.data);
    } catch (error) {
      setError('Error al consultar los productos');
      console.error('Error al consultar los productos:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchInventario = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
        // Eliminar los valores null o undefined
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null)
      );
      const response = await axios.get('http://localhost:3000/v1/getTablaProductoVencidoSP',{
        params: cleanFilters
      });

      setInventario(response.data.data);
    } catch (error) {
      setError('Error al consultar el inventario');
      console.error('Error al consultar el inventario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProductoChange = (selectedOption) => {
    setSelectedProducto(selectedOption);
  };

  const handleSelectCodigoChange = (selectedOption) => {
    setSelectedCodigo(selectedOption);
  };

  const handleBuscarClick = () => {
    const filters = {
        Nombres: selectedProducto ? selectedProducto.map(option => option.label).join(',') : null,
        ProductoID: selectedCodigo ? selectedCodigo.value.ProductoID : null
    };
    fetchInventario(filters);
    //setSelectedProducto(null);
    //setSelectedCodigo(null);
  };
  

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewProducto({ ...newProducto, [name]: value });
  };

    const handleDateChange = (date) => {
        setNewProducto({ ...newProducto, FechaCaducidad: date });
      };



  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Consultar Inventario</h2>
      {error && <p>{error}</p>}
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ flex: 1, marginRight: '10px' }}>
            <label>Nombres Producto</label>
          <Select
            options={productos.map(prod => ({ value: prod, label: prod.Nombre }))}
            onChange={handleSelectProductoChange}
            placeholder="Selecciona un producto"
            isClearable
            isMulti
          />
            </div>
            <div style={{ flex: 1, marginLeft: '10px' }}>
          </div>
          </div>
          <button onClick={handleBuscarClick} style={{ marginBottom: '20px' }}>Buscar</button>
          <div style={{ marginBottom: '20px' }}>
          <ActAgrProductos 
            productos={productos}
            newProducto={newProducto}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            handleSelectProductoChange={handleSelectProductoChange}
          />
          <EliminarCantidadProducto
          productos={productos}
          />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
              <th style={{ border: '1px solid #ddd', padding: '9px' }}>ProductoID</th>
              <th style={{ border: '1px solid #ddd', padding: '9px' }}>Nombre</th>
                <th style={{ border: '1px solid #ddd', padding: '9px' }}>Descripción</th>
                <th style={{ border: '1px solid #ddd', padding: '9px' }}>Fecha de Creación</th>
                <th style={{ border: '1px solid #ddd', padding: '9px' }}>Cantidad Restante</th>
                <th style={{ border: '1px solid #ddd', padding: '9px' }}>Estado</th>
                <th style={{ border: '1px solid #ddd', padding: '9px' }}>Fecha Caducidad</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((producto) => (
                <tr key={producto.ProductoID}>
                  <td style={{ border: '1px solid #ddd', padding: '9px' }}>{producto.ProductoID}</td>
                  <td style={{ border: '1px solid #ddd', padding: '9px' }}>{producto.Nombre}</td>
                  <td style={{ border: '1px solid #ddd', padding: '9px' }}>{producto.Descripcion}</td>
                  <td style={{ border: '1px solid #ddd', padding: '9px' }}>{producto.FechaCreacion}</td>
                  <td style={{ border: '1px solid #ddd', padding: '9px' }}>{producto.Cantidad}</td>
                  <td style={{ border: '1px solid #ddd', padding: '9px' }}>{producto.Estado}</td>
                  <td style={{ border: '1px solid #ddd', padding: '9px' }}>{producto.FechaCaducidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsultarInventario;
