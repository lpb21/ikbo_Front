import React from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../recursos/styles.css";
import axios from "axios";

const ActAgrProductos = ({
  productos,
  newProducto,
  handleInputChange,
  handleDateChange,
  handleSelectProductoChange,
}) => {
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = "" + (d.getMonth() + 1);
    const day = "" + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-");
  };

  const handleSubmit = async () => {
    try {
      const productoToSend = {
        ...newProducto,
        FechaCaducidad: formatDate(newProducto.FechaCaducidad),
      };
      delete productoToSend.Nombres;
      const response = await axios.post(
        "http://localhost:3000/v1/crearProductoSP",
        productoToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { message, producto } = response.data;
      const productoInfo = producto[0];
      const formattedMessage = `
        ${message}
        Producto ID: ${productoInfo.ProductoID}
        Nombre: ${productoInfo.Nombre}
        Descripción: ${productoInfo.Descripcion}
        Cantidad: ${productoInfo.Cantidad}
        Fecha de Caducidad: ${productoInfo.FechaCaducidad}
      `;

      alert(formattedMessage);
    } catch (error) {
      console.error("Error:", error);
      alert("Error en la petición");
    }
  };
  const handleSelectChange = (selectedOption) => {
    handleSelectProductoChange(selectedOption);
    handleInputChange({
      target: {
        name: "Nombre",
        value: selectedOption ? selectedOption.label : "",
      },
    });
  };

  return (
    <div>
      <h3>Agregar/Actualizar Producto</h3>
      <label>Nombres Producto</label>
      <Select
        options={productos.map((prod) => ({ value: prod, label: prod.Nombre }))}
        onChange={handleSelectChange}
        placeholder="Selecciona un producto"
        isClearable
      />
      <input
        type="text"
        name="Descripcion"
        placeholder="Descripción"
        value={newProducto.Descripcion}
        onChange={handleInputChange}
        className="input-field" // Aplica la clase CSS
      />
      <input
        type="number"
        name="Cantidad"
        placeholder="Cantidad Restante"
        value={newProducto.Cantidad}
        onChange={handleInputChange}
        className="input-field" // Aplica la clase CSS
      />
      <label>Fecha de Caducidad</label>
      <DatePicker
        selected={newProducto.FechaCaducidad}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        placeholderText="Selecciona una fecha"
        className="input-field" // Aplica la clase CSS
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

export default ActAgrProductos;
