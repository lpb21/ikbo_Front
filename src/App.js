import React from 'react';
import ConsultarInventario from './consultarInventario.jsx';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Gestión de Inventario</h1>
      </header>
      <main>
        <ConsultarInventario />
      </main>
    </div>
  );
};

export default App;
