import React, { useState } from 'react';
import axios from 'axios';

const RealizarSalida = () => {
  const [salida, setSalida] = useState({
    ProductoID: '',
    Cantidad: ''
  });

  const handleChange = (e) => {
    setSalida({
      ...salida,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/salida-inventario', salida);
      alert(response.data.message);
    } catch (error) {
      console.error('Error al realizar la salida de inventario:', error);
      alert('Error al realizar la salida de inventario');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Realizar Salida</h2>
      <input type="number" name="ProductoID" placeholder="ID del Producto" onChange={handleChange} required />
      <input type="number" name="Cantidad" placeholder="Cantidad" onChange={handleChange} required />
      <button type="submit">Realizar Salida</button>
    </form>
  );
};

export default RealizarSalida;