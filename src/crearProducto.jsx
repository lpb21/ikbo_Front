import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select'

const CrearProducto = () => {
  const [producto, setProducto] = useState({
    Nombre: '',
    Descripcion: '',
    Cantidad: '',
    FechaCaducidad: ''
  });

  const handleChange = (e) => {
    setProducto({
      ...producto,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/crear-producto', producto);
      alert(response.data.message);
    } catch (error) {
      console.error('Error al crear el producto:', error);
      alert('Error al crear el producto');
    }
  };
  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Producto</h2>
      <input type="text" name="Nombre" placeholder="Nombre" onChange={handleChange} required />
      <input type="text" name="Descripcion" placeholder="Descripción" onChange={handleChange} required />
      <input type="number" name="Cantidad" placeholder="Cantidad" onChange={handleChange} required />
      <input type="date" name="FechaCaducidad" placeholder="Fecha de Caducidad" onChange={handleChange} required />
      <Select options={options} />
      <button type="submit">Crear Producto</button>
    </form>
  );
};

//export default CrearProducto;