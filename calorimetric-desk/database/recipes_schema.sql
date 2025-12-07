-- ============================================
-- Database Schema for Recipe Management
-- ============================================

-- Table: Tiempos (Meal Types)
CREATE TABLE Tiempos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  Nombre TEXT NOT NULL UNIQUE
);

-- Table: Ingredientes
CREATE TABLE Ingredientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
);

-- Table: Recetas
CREATE TABLE Recetas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  TiempoId INTEGER NOT NULL,
  tiempo_preparacion TEXT,
  calorias INTEGER,
  imagen TEXT,
  link TEXT,
  FOREIGN KEY (TiempoId) REFERENCES Tiempos(id)
);

-- Table: RecetaIngredientes (Many-to-Many relationship)
CREATE TABLE RecetaIngredientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  RecetaId INTEGER NOT NULL,
  IngredienteId INTEGER NOT NULL,
  FOREIGN KEY (RecetaId) REFERENCES Recetas(id) ON DELETE CASCADE,
  FOREIGN KEY (IngredienteId) REFERENCES Ingredientes(id) ON DELETE CASCADE,
  UNIQUE(RecetaId, IngredienteId)
);

-- ============================================
-- Insert Data: Tiempos (Meal Types)
-- ============================================
INSERT INTO Tiempos (Nombre) VALUES ('Desayuno');
INSERT INTO Tiempos (Nombre) VALUES ('Comida');
INSERT INTO Tiempos (Nombre) VALUES ('Cena');

-- ============================================
-- Insert Data: Ingredientes
-- ============================================
INSERT INTO Ingredientes (nombre) VALUES ('Quinoa');
INSERT INTO Ingredientes (nombre) VALUES ('Aguacate');
INSERT INTO Ingredientes (nombre) VALUES ('Huevo pochado');
INSERT INTO Ingredientes (nombre) VALUES ('Espinacas');
INSERT INTO Ingredientes (nombre) VALUES ('Tomate cherry');
INSERT INTO Ingredientes (nombre) VALUES ('Limón');
INSERT INTO Ingredientes (nombre) VALUES ('Pescado blanco');
INSERT INTO Ingredientes (nombre) VALUES ('Tortillas de maíz');
INSERT INTO Ingredientes (nombre) VALUES ('Col morada');
INSERT INTO Ingredientes (nombre) VALUES ('Cilantro');
INSERT INTO Ingredientes (nombre) VALUES ('Salsa de yogurt');
INSERT INTO Ingredientes (nombre) VALUES ('Nopales');
INSERT INTO Ingredientes (nombre) VALUES ('Tomate');
INSERT INTO Ingredientes (nombre) VALUES ('Cebolla');
INSERT INTO Ingredientes (nombre) VALUES ('Queso fresco');
INSERT INTO Ingredientes (nombre) VALUES ('Chile serrano');
INSERT INTO Ingredientes (nombre) VALUES ('Tortillas horneadas');
INSERT INTO Ingredientes (nombre) VALUES ('Salsa verde');
INSERT INTO Ingredientes (nombre) VALUES ('Pollo desmenuzado');
INSERT INTO Ingredientes (nombre) VALUES ('Crema light');
INSERT INTO Ingredientes (nombre) VALUES ('Camarón');
INSERT INTO Ingredientes (nombre) VALUES ('Pepino');
INSERT INTO Ingredientes (nombre) VALUES ('Cebolla morada');
INSERT INTO Ingredientes (nombre) VALUES ('Frijoles negros');
INSERT INTO Ingredientes (nombre) VALUES ('Ajo');
INSERT INTO Ingredientes (nombre) VALUES ('Comino');
INSERT INTO Ingredientes (nombre) VALUES ('Chile chipotle');
INSERT INTO Ingredientes (nombre) VALUES ('Pan integral');
INSERT INTO Ingredientes (nombre) VALUES ('Frijoles refritos');
INSERT INTO Ingredientes (nombre) VALUES ('Queso panela');
INSERT INTO Ingredientes (nombre) VALUES ('Pico de gallo');
INSERT INTO Ingredientes (nombre) VALUES ('Pollo');
INSERT INTO Ingredientes (nombre) VALUES ('Maíz pozolero');
INSERT INTO Ingredientes (nombre) VALUES ('Tomatillos');
INSERT INTO Ingredientes (nombre) VALUES ('Chile poblano');
INSERT INTO Ingredientes (nombre) VALUES ('Lechuga');
INSERT INTO Ingredientes (nombre) VALUES ('Rábanos');
INSERT INTO Ingredientes (nombre) VALUES ('Orégano');
INSERT INTO Ingredientes (nombre) VALUES ('Jícama');
INSERT INTO Ingredientes (nombre) VALUES ('Mango');
INSERT INTO Ingredientes (nombre) VALUES ('Chile en polvo');
INSERT INTO Ingredientes (nombre) VALUES ('Huevos');
INSERT INTO Ingredientes (nombre) VALUES ('Tortilla integral');
INSERT INTO Ingredientes (nombre) VALUES ('Salsa ranchera');
INSERT INTO Ingredientes (nombre) VALUES ('Atún en agua');
INSERT INTO Ingredientes (nombre) VALUES ('Tostadas horneadas');
INSERT INTO Ingredientes (nombre) VALUES ('Calabaza');
INSERT INTO Ingredientes (nombre) VALUES ('Caldo de pollo');
INSERT INTO Ingredientes (nombre) VALUES ('Leche descremada');
INSERT INTO Ingredientes (nombre) VALUES ('Nuez moscada');
INSERT INTO Ingredientes (nombre) VALUES ('Pepitas');

-- ============================================
-- Insert Data: Recetas
-- ============================================

-- Recipe 1: Bowl de Quinoa y Aguacate
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Bowl de Quinoa y Aguacate', 1, '15 min', 320, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop');

-- Recipe 2: Tacos de Pescado con Col Morada
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Tacos de Pescado con Col Morada', 2, '25 min', 380, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop');

-- Recipe 3: Ensalada de Nopales
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Ensalada de Nopales', 3, '20 min', 180, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop');

-- Recipe 4: Chilaquiles Verdes con Pollo
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Chilaquiles Verdes con Pollo', 1, '30 min', 420, 'https://images.unsplash.com/photo-1599974715142-a5ec2f90e8cc?w=400&h=300&fit=crop');

-- Recipe 5: Ceviche de Camarón
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Ceviche de Camarón', 2, '40 min', 210, 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop');

-- Recipe 6: Sopa de Frijoles Negros
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Sopa de Frijoles Negros', 3, '35 min', 280, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop');

-- Recipe 7: Molletes Integrales
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Molletes Integrales', 1, '15 min', 310, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop');

-- Recipe 8: Pozole Verde Light
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Pozole Verde Light', 2, '45 min', 350, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop');

-- Recipe 9: Ensalada de Jícama y Mango
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Ensalada de Jícama y Mango', 3, '10 min', 150, 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop');

-- Recipe 10: Huevos Rancheros Saludables
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Huevos Rancheros Saludables', 1, '20 min', 290, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop');

-- Recipe 11: Tostadas de Atún
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Tostadas de Atún', 2, '15 min', 270, 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=400&h=300&fit=crop');

-- Recipe 12: Crema de Calabaza
INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen)
VALUES ('Crema de Calabaza', 3, '30 min', 160, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop');

-- ============================================
-- Insert Data: RecetaIngredientes (Relationships)
-- ============================================

-- Recipe 1: Bowl de Quinoa y Aguacate (Quinoa, Aguacate, Huevo pochado, Espinacas, Tomate cherry, Limón)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (1, 1);  -- Quinoa
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (1, 2);  -- Aguacate
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (1, 3);  -- Huevo pochado
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (1, 4);  -- Espinacas
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (1, 5);  -- Tomate cherry
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (1, 6);  -- Limón

-- Recipe 2: Tacos de Pescado con Col Morada (Pescado blanco, Tortillas de maíz, Col morada, Cilantro, Limón, Salsa de yogurt)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (2, 7);  -- Pescado blanco
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (2, 8);  -- Tortillas de maíz
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (2, 9);  -- Col morada
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (2, 10); -- Cilantro
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (2, 6);  -- Limón
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (2, 11); -- Salsa de yogurt

-- Recipe 3: Ensalada de Nopales (Nopales, Tomate, Cebolla, Cilantro, Queso fresco, Limón, Chile serrano)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (3, 12); -- Nopales
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (3, 13); -- Tomate
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (3, 14); -- Cebolla
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (3, 10); -- Cilantro
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (3, 15); -- Queso fresco
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (3, 6);  -- Limón
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (3, 16); -- Chile serrano

-- Recipe 4: Chilaquiles Verdes con Pollo (Tortillas horneadas, Salsa verde, Pollo desmenuzado, Crema light, Queso fresco, Cebolla)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (4, 17); -- Tortillas horneadas
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (4, 18); -- Salsa verde
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (4, 19); -- Pollo desmenuzado
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (4, 20); -- Crema light
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (4, 15); -- Queso fresco
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (4, 14); -- Cebolla

-- Recipe 5: Ceviche de Camarón (Camarón, Limón, Tomate, Pepino, Cebolla morada, Cilantro, Aguacate)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (5, 21); -- Camarón
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (5, 6);  -- Limón
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (5, 13); -- Tomate
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (5, 22); -- Pepino
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (5, 23); -- Cebolla morada
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (5, 10); -- Cilantro
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (5, 2);  -- Aguacate

-- Recipe 6: Sopa de Frijoles Negros (Frijoles negros, Cebolla, Ajo, Comino, Chile chipotle, Cilantro, Aguacate)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (6, 24); -- Frijoles negros
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (6, 14); -- Cebolla
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (6, 25); -- Ajo
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (6, 26); -- Comino
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (6, 27); -- Chile chipotle
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (6, 10); -- Cilantro
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (6, 2);  -- Aguacate

-- Recipe 7: Molletes Integrales (Pan integral, Frijoles refritos, Queso panela, Pico de gallo, Aguacate)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (7, 28); -- Pan integral
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (7, 29); -- Frijoles refritos
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (7, 30); -- Queso panela
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (7, 31); -- Pico de gallo
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (7, 2);  -- Aguacate

-- Recipe 8: Pozole Verde Light (Pollo, Maíz pozolero, Tomatillos, Chile poblano, Lechuga, Rábanos, Orégano)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (8, 32); -- Pollo
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (8, 33); -- Maíz pozolero
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (8, 34); -- Tomatillos
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (8, 35); -- Chile poblano
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (8, 36); -- Lechuga
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (8, 37); -- Rábanos
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (8, 38); -- Orégano

-- Recipe 9: Ensalada de Jícama y Mango (Jícama, Mango, Pepino, Chile en polvo, Limón, Cilantro)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (9, 39); -- Jícama
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (9, 40); -- Mango
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (9, 22); -- Pepino
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (9, 41); -- Chile en polvo
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (9, 6);  -- Limón
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (9, 10); -- Cilantro

-- Recipe 10: Huevos Rancheros Saludables (Huevos, Tortilla integral, Salsa ranchera, Frijoles negros, Aguacate, Cilantro)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (10, 42); -- Huevos
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (10, 43); -- Tortilla integral
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (10, 44); -- Salsa ranchera
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (10, 24); -- Frijoles negros
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (10, 2);  -- Aguacate
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (10, 10); -- Cilantro

-- Recipe 11: Tostadas de Atún (Atún en agua, Tostadas horneadas, Aguacate, Tomate, Cebolla, Limón, Lechuga)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (11, 45); -- Atún en agua
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (11, 46); -- Tostadas horneadas
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (11, 2);  -- Aguacate
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (11, 13); -- Tomate
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (11, 14); -- Cebolla
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (11, 6);  -- Limón
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (11, 36); -- Lechuga

-- Recipe 12: Crema de Calabaza (Calabaza, Cebolla, Ajo, Caldo de pollo, Leche descremada, Nuez moscada, Pepitas)
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (12, 47); -- Calabaza
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (12, 14); -- Cebolla
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (12, 25); -- Ajo
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (12, 48); -- Caldo de pollo
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (12, 49); -- Leche descremada
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (12, 50); -- Nuez moscada
INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (12, 51); -- Pepitas
