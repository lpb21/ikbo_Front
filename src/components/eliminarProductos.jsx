import React, { useState } from "react";
import axios from "axios";
import "../recursos/styles.css";

const EliminarCantidadProducto = ({ productos }) => {
  const [productoID, setProductoID] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState(null);

  const handleProductoIDChange = (e) => {
    setProductoID(e.target.value);
  };

  const handleCantidadChange = (e) => {
    setCantidad(e.target.value);
  };

  const handleSubmit = async () => {
    const productoToSend = {
      ProductoID: parseInt(productoID, 10),
      Cantidad: parseInt(cantidad, 10),
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/v1/salidaProductoSP",
        productoToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { message } = response.data;
      alert(`Respuesta del servidor: ${message}`);
      setError(null); // Limpiar el error si la solicitud es exitosa
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.mns || "Error en la petición";
      if (
        errorMessage ===
        "No hay suficiente cantidad en el inventario para realizar la salida."
      ) {
        alert(
          "No hay suficiente cantidad en el inventario para realizar la salida."
        );
      } else {
        alert(errorMessage);
      }
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h3>Eliminar Cantidad de Producto</h3>
      <label>Producto</label>
      <select
        value={productoID}
        onChange={handleProductoIDChange}
        className="input-field"
      >
        <option value="">Selecciona un producto</option>
        {productos.map((prod) => (
          <option key={prod.ProductoID} value={prod.ProductoID}>
            {prod.Nombre}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="Cantidad"
        placeholder="Cantidad a eliminar"
        value={cantidad}
        onChange={handleCantidadChange}
        className="input-field"
      />
      <button
        onClick={handleSubmit}
        style={{ display: "block", marginTop: "10px" }}
      >
        Enviar
      </button>
    </div>
  );
};

export default EliminarCantidadProducto;
