# 📋 API ikbo - Para consulta y registro de productos perecederos

¡Bienvenido! 🚀 Este proyecto contiene los **scripts SQL** necesarios para la creación de tablas y  **Stored Procedure (SP)**, diseñado para gestionar un sistema de productos. Además, he incluido un video tutorial 📹 que te dara una vision mas clara de lo que realize en la aplicacion.

---

## 📑 Contenido

1. [📂 Scripts SQL](#-scripts-sql)
2. [🔧 Creación del Stored Procedure](#-creación-del-stored-procedure)
3. [🎥 Video Tutorial](#-video-tutorial)
4. [🚀 Cómo Ejecutar los Scripts](#cómo-ejecutar-los-scripts)
5. [🌐 Endpoints API](#endpoints-api)
6. [📜 Requisitos](#requisitos)
7. [⚠️ Notas Importantes](#notas-importantes)
8. [📋 Notas del Autor](#notas-del-autor)


## 📂 Scripts SQL

### 1 Base de Datos: `ikbo`
```sql
CREATE DATABASE InventarioPerecederosIKBO;

USE InventarioPerecederosIKBO;
```

### 1.1 Tabla: `Productos`
```sql
CREATE TABLE Productos (
    ProductoID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(255),
    FechaCreacion DATETIME DEFAULT GETDATE()
);
```
### 1.2 Tabla: `EntradasInventario`
```sql
CREATE TABLE EntradasInventario (
    EntradaID INT IDENTITY(1,1) PRIMARY KEY,
    ProductoID INT NOT NULL,
    Cantidad INT NOT NULL,
    FechaCaducidad DATE NOT NULL,
    FechaEntrada DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductoID) REFERENCES Productos(ProductoID)
);
```

### 1.3 Tabla: `SalidasInventario`
```sql
CREATE TABLE SalidasInventario (
    SalidaID INT IDENTITY(1,1) PRIMARY KEY,
    ProductoID INT NOT NULL,
    Cantidad INT NOT NULL,
    FechaSalida DATETIME,-- DEFAULT GETDATE(),
    FOREIGN KEY (ProductoID) REFERENCES Productos(ProductoID)
);
```

### 1.4 Tabla: `Insercion de Datos`
```sql
INSERT INTO Productos (Nombre, Descripcion)
VALUES 
('Manzanas', 'Manzanas frescas'),
('Plátanos', 'Platanos maduros'),
('Leche', 'Leche entera'),
('Yogur', 'Yogurt'),
('Queso', 'Queso cheddar'),
('Huevos', 'Huevos de gallina'),
('Pan', 'Pan integral'),
('Tomates', 'Tomates rojos'),
('Zanahorias', 'Zanahorias frescas'),
('Pollo', 'Pollo fresco'),
('Pescado', 'Pescado fresco'),
('Carne de res', 'Carne de res'),
('Naranjas', 'Naranjas tangelo'),
('Uvas', 'Uvas sin semillas'),
('Lechuga', 'Lechuga hidroponica');
```
```sql
INSERT INTO EntradasInventario (ProductoID, Cantidad, FechaCaducidad)
VALUES 
(1, 100, '2024-12-20'),
(2, 150, '2024-12-20'),
(3, 200, '2024-12-20'),
(4, 120, '2024-12-27'),
(5, 80, '2024-12-28'),
(6, 300, '2025-01-12'),
(7, 50, '2025-01-28'),
(8, 90, '2025-01-02'),
(9, 110, '2024-12-25'),
(10, 70, '2025-03-22'),
(11, 60, '2025-04-05'),
(12, 40, '2024-12-12'),
(13, 130, '2024-12-05'),
(14, 140, '2024-12-17'),
(15, 160, '2025-01-02');
```
```sql
INSERT INTO SalidasInventario (ProductoID, Cantidad)
VALUES 
(1, 20),
(2, 30),
(3, 50),
(4, 25),
(5, 10),
(6, 60),
(7, 5),
(8, 15),
(9, 20),
(10, 10),
(11, 8),
(12, 5),
(13, 25),
(14, 30),
(15, 40);
```

---
## 🔧 Creación de Stored Procedures
### 2 El siguiente Stored Procedure valida los datos de caducidad de los productos:

```sql
CREATE PROCEDURE sp_ProductosConEstado
    @ProductoID INT = NULL,
    @Nombres NVARCHAR(MAX) = NULL
AS
BEGIN
    SELECT 
        p.ProductoID,
        p.Nombre,
        p.Descripcion,
        p.FechaCreacion,
        ei.EntradaID,
        ei.Cantidad,
        ei.FechaCaducidad,
        ei.FechaEntrada,
        CASE 
            WHEN DATEDIFF(DAY, GETDATE(), ei.FechaCaducidad) < 0 THEN 'Vencido'
            WHEN DATEDIFF(DAY, GETDATE(), ei.FechaCaducidad) <= 3 THEN 'Por vencer'
            ELSE 'Vigente'
        END AS Estado
    FROM 
        Productos p
    LEFT JOIN 
        EntradasInventario ei ON p.ProductoID = ei.ProductoID
    WHERE 
        (@ProductoID IS NULL OR p.ProductoID = @ProductoID) AND
        (@Nombres IS NULL OR p.Nombre IN (SELECT value FROM STRING_SPLIT(@Nombres, ',')));
END
```

### 2.1 El siguiente Stored Procedure crea el producto ingresado:
```sql
CREATE PROCEDURE sp_CrearProducto
    @Nombres NVARCHAR(255),
    @Descripcion NVARCHAR(255),
    @Cantidad INT,
    @FechaCaducidad DATETIME
AS
BEGIN
    -- Insertar el producto
    INSERT INTO Productos (Nombre, Descripcion, FechaCreacion)
    VALUES (@Nombres, @Descripcion, GETDATE());

    -- Obtener el ID del producto recién insertado
    DECLARE @NuevoProductoID INT;
    SET @NuevoProductoID = SCOPE_IDENTITY();

    -- Insertar la entrada de inventario
    INSERT INTO EntradasInventario (ProductoID, Cantidad, FechaCaducidad, FechaEntrada)
    VALUES (@NuevoProductoID, @Cantidad, @FechaCaducidad, GETDATE());

    -- Devolver los detalles del producto recién insertado
    SELECT p.ProductoID, p.Nombre, p.Descripcion, p.FechaCreacion, e.EntradaID, e.Cantidad, e.FechaCaducidad, e.FechaEntrada
    FROM Productos p
    JOIN EntradasInventario e ON p.ProductoID = e.ProductoID
    WHERE p.ProductoID = @NuevoProductoID;
END;
```


### 2.2 El siguiente Stored Procedure genera la salida del producto:
```sql
CREATE PROCEDURE sp_RealizarSalida
    @ProductoID INT,
    @Cantidad INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CantidadDisponible INT;
    DECLARE @CantidadRestante INT;
    DECLARE @EntradaID INT;
    DECLARE @CantidadEnEntrada INT;

    -- Verificar la cantidad total disponible en el inventario para el producto
    SELECT @CantidadDisponible = SUM(Cantidad)
    FROM EntradasInventario
    WHERE ProductoID = @ProductoID;

    IF @CantidadDisponible IS NULL OR @CantidadDisponible < @Cantidad
    BEGIN
        -- No hay suficiente cantidad en el inventario
        RAISERROR('No hay suficiente cantidad en el inventario para realizar la salida.', 16, 1);
        RETURN;
    END

    -- Registrar la salida en la tabla SalidasInventario
    INSERT INTO SalidasInventario (ProductoID, Cantidad, FechaSalida)
    VALUES (@ProductoID, @Cantidad, GETDATE());

    -- Actualizar la cantidad disponible en las entradas de inventario
    SET @CantidadRestante = @Cantidad;

    DECLARE entrada_cursor CURSOR FOR
    SELECT EntradaID, Cantidad
    FROM EntradasInventario
    WHERE ProductoID = @ProductoID
    ORDER BY FechaEntrada;

    OPEN entrada_cursor;

    FETCH NEXT FROM entrada_cursor INTO @EntradaID, @CantidadEnEntrada;

    WHILE @@FETCH_STATUS = 0 AND @CantidadRestante > 0
    BEGIN
        IF @CantidadEnEntrada <= @CantidadRestante
        BEGIN
            -- Restar toda la cantidad de esta entrada
            UPDATE EntradasInventario
            SET Cantidad = 0
            WHERE EntradaID = @EntradaID;

            SET @CantidadRestante = @CantidadRestante - @CantidadEnEntrada;
        END
        ELSE
        BEGIN
            -- Restar parte de la cantidad de esta entrada
            UPDATE EntradasInventario
            SET Cantidad = Cantidad - @CantidadRestante
            WHERE EntradaID = @EntradaID;

            SET @CantidadRestante = 0;
        END

        FETCH NEXT FROM entrada_cursor INTO @EntradaID, @CantidadEnEntrada;
    END

    CLOSE entrada_cursor;
    DEALLOCATE entrada_cursor;

	-- Devolver los detalles del producto y la cantidad restante en el inventario
    SELECT p.ProductoID, p.Nombre, p.Descripcion, p.FechaCreacion, 
           ISNULL(SUM(e.Cantidad), 0) AS CantidadRestante
    FROM Productos p
    LEFT JOIN EntradasInventario e ON p.ProductoID = e.ProductoID
    WHERE p.ProductoID = @ProductoID
    GROUP BY p.ProductoID, p.Nombre, p.Descripcion, p.FechaCreacion;
END;
```

---
## 🎥 Video Explicativo
Para ver el video de una prueba en vivo del desarrollo, haz clic en el siguiente enlace:

[**Ver Video Explicativo**](https://drive.google.com/file/d/1lUdyJxWMRs-zNUeZkzVa15YNz7hqJmlW/view?usp=sharing)

---

## 🚀 Cómo Ejecutar los Scripts

1. **Abre SQL Server Management Studio (SSMS) o tu gestor favorito, en mi caso es DBeaver**.
2. **Crea la base de datos y las tablas correspondientes.**
3. **Crea los Stored Procedure**.
4. **Ejecutar los scripts de insercion iniciales** 

---

## 🌐 Endpoints API

Aquí puedes detallar los **endpoints** de la API que interactúan con el sistema de usuarios.

### GET `HTTP://localhost:3000/v1/getTablaProducto`
Este endpoint permite consultar los productos registrados en la base de datos.
### GET `HTTP://localhost:3000/v1/getTablaProductoVencidoSP`
Este endpoint permite consultar los productos y si estado de acuerdo a la fecha de caducidad.
### POST `HTTP://localhost:3000/v1/crearProductoSP`
Este endpoint permite agregar un nuevo producto a la base de datos.
### POST `HTTP://localhost:3000/v1/salidaProductoSP`
Este endpoint permite darle salida unidades de productos.


---
## 📜 Requisitos
- **SQL Server 2016 o superior**.
- **SQL Server Management Studio (SSMS)**.
- **POSTMAN**.

---
## 🚀 Cómo Configurar el Proyecto y Ejecutarlo
## Prerrequisitos

- **Asegúrate de tener instalado Node.js y npm en tu sistema. Puedes descargarlos desde [Node.js](https://nodejs.org/).**

- **Sigue estos pasos para ejecutar los 2 proyectos en tu entorno de desarrollo local:**

1. **Clona los repositorios en ubicaciones separadas preferiblemente**:

   ```bash
   git clone https://github.com/lpb21/ikbo_Back.git
   git clone https://github.com/lpb21/ikbo_Front.git

2. **En el que dice xx navega al directorio del proyecto**:

   ```bash
   cd ikboapi
   
3. **Igual que nel paso anterior navega al directorio del proyecto xxx**:
   ```bash
   cd ikbofront2

4. **Instala las dependencias**:

   Ejecuta el siguiente comando para instalar todas las dependencias del proyecto:

   ```bash
   npm install

* Esto descargará todas las dependencias especificadas en el archivo package.json y las instalará localmente en la carpeta node_modules.


4. **Inicia el servidor**:

   Utiliza el siguiente comando para iniciar el servidor:

   ```bash
   npm run dev y npm start en el caso del front
   

**El servidor se ejecutará en http://localhost:3000/ para el back de forma predeterminada y en http://localhost:3001 para el front. Puedes abrir este enlace en tu navegador para ver la aplicación en ejecución.**

**Navega a la aplicación:**

 **Abre tu navegador web y navega a http://localhost:3000/ para acceder a la aplicación del back**

---
## ⚠️ Notas Importantes

- Como los scripts de bases de datos estan en sql server, si tienen alguna inquietud sobre como se habilita el usuario 'sa' o se habilitan los puertos TCP, estare encantado de comentarles el proceso

---

## 📋 Notas del Autor
- He diseñado este readme con un enfoque detallado y explicativo, con la intención de facilitar la comprensión de cada aspecto del sistema. Mi objetivo es asegurar que tanto los desarrolladores novatos como los más experimentados puedan seguir las instrucciones sin dificultad. No pretendo subestimar las capacidades de nadie; más bien, deseo proporcionar una guía clara y accesible para todos.

- Aprecio cualquier retroalimentación constructiva que pueda ayudarme a mejorar la documentación o el proyecto en general.
Muchas Gracias

