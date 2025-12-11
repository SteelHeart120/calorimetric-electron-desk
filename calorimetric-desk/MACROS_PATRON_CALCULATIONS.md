# Documentación de Cálculos - Tablas Macros y Patrón

## Diccionario Base: `equivByGroupsDict`

Suma de todos los equivalentes (Equiv) de cada grupo alimenticio a través de las 5 columnas de tiempo (Desayuno, Almuerzo, Comida, Post-entreno, Cena) en la tabla Patrón.

### Fórmula General
```
equivByGroupsDict[grupo] = Σ(grupoAlimenticioData[grupo][i] / 7) para i = 0 a 4
```

### Grupos Incluidos
- Lácteos
- Frutas
- Verduras
- Leguminosas
- Cereales
- Azúcares
- AOAM (Alimento de Origen Animal Moderado)
- AOAB (Alimento de Origen Animal Bajo)
- AOAMB (Alimento de Origen Animal Muy Bajo)
- Lípidos
- Líp+proteína

---

## Tabla Patrón - Primera Tabla

### Estructura de Columnas
Para cada tiempo (1-5):
- **Equiv**: `(grupoAlimenticioData[grupo][tiempo] / 7).toFixed(2)`
- **ene** (energía): `Equiv * valorCalórico[grupo]`

### Valores Calóricos por Grupo
| Grupo | Valor Calórico |
|-------|----------------|
| Lácteos | 95 |
| Frutas | 60 |
| Verduras | 25 |
| Leguminosas | 120 |
| Cereales | 70 |
| Azúcares | 40 |
| AOAM | 75 |
| AOAB | 55 |
| AOAMB | 40 |
| Lípidos | 45 |
| Líp+proteína | 65 |

### Fila "Calorias Totales"
```
eneByTiempo[i] = Σ(Equiv[grupo][tiempo_i] * valorCalórico[grupo])
totalCalorias = Σ(eneByTiempo[i]) para i = 0 a 4
```

### Fila "% de la dieta"
```
percentByTiempo[i] = (eneByTiempo[i] / totalCalorias) * 100
totalPercent = Σ(percentByTiempo[i])
```

---

## Tabla Macros - Primera Tabla

### Lacteos
#### Leche descremada
- **Intercambios**: `equivByGroupsDict['Lácteos']`
- **Carbohidratos**: `Intercambios × 12`
- **Proteínas**: `Intercambios × 9`
- **Lípidos**: `Intercambios × 2`
- **Calorías**: `Intercambios × 95`

### Fruta
- **Intercambios**: `equivByGroupsDict['Frutas']`
- **Carbohidratos**: `Intercambios × 15`
- **Proteínas**: `0`
- **Lípidos**: `0`
- **Calorías**: `Intercambios × 60`

### Verdura
- **Intercambios**: `equivByGroupsDict['Verduras']`
- **Carbohidratos**: `Intercambios × 4`
- **Proteínas**: `Intercambios × 2`
- **Lípidos**: `0`
- **Calorías**: `Intercambios × 25`

### Leguminosas
- **Intercambios**: `equivByGroupsDict['Leguminosas']`
- **Carbohidratos**: `Intercambios × 20`
- **Proteínas**: `Intercambios × 8`
- **Lípidos**: `Intercambios × 1`
- **Calorías**: `Intercambios × 120`

### Azucares sin grasa
- **Intercambios**: `equivByGroupsDict['Azúcares']`
- **Carbohidratos**: `Intercambios × 10`
- **Proteínas**: `0`
- **Lípidos**: `0`
- **Calorías**: `Intercambios × 40`

### Total carbohidratos no cereales
- **Carbohidratos**: Suma de carbohidratos de:
  - Lácteos + Frutas + Verduras + Leguminosas + Azúcares

### Cereales sin grasa
- **Intercambios**: `equivByGroupsDict['Cereales']`
- **Carbohidratos**: `Intercambios × 15`
- **Proteínas**: `Intercambios × 2`
- **Lípidos**: `0`
- **Calorías**: `Intercambios × 70`

### Total proteinas no animales
- **Proteínas**: Suma de proteínas de:
  - Lácteos + Verduras + Leguminosas + Cereales

### Animal - Muy bajo (AOAMB)
- **Intercambios**: `equivByGroupsDict['AOAMB']`
- **Carbohidratos**: `0`
- **Proteínas**: `Intercambios × 7`
- **Lípidos**: `Intercambios × 1`
- **Calorías**: `Intercambios × 40`

### Animal - Bajo (AOAB)
- **Intercambios**: `equivByGroupsDict['AOAB']`
- **Carbohidratos**: `0`
- **Proteínas**: `Intercambios × 7`
- **Lípidos**: `Intercambios × 3`
- **Calorías**: `Intercambios × 55`

### Animal - Moderado (AOAM)
- **Intercambios**: `equivByGroupsDict['AOAM']`
- **Carbohidratos**: `0`
- **Proteínas**: `Intercambios × 7`
- **Lípidos**: `Intercambios × 5`
- **Calorías**: `Intercambios × 75`

### Total lipidos no grasas
- **Lípidos**: Suma de lípidos de:
  - Lácteos + Leguminosas + AOAMB + AOAB + AOAM

### Lipidos con proteina (Líp+proteína)
- **Intercambios**: `equivByGroupsDict['Líp+proteína']`
- **Carbohidratos**: `Intercambios × 2`
- **Proteínas**: `Intercambios × 2`
- **Lípidos**: `Intercambios × 5`
- **Calorías**: `Intercambios × 65`

### Lipidos
- **Intercambios**: `equivByGroupsDict['Lípidos']`
- **Carbohidratos**: `0`
- **Proteínas**: `0`
- **Lípidos**: `Intercambios × 5`
- **Calorías**: `Intercambios × 45`

### Total
- **Carbohidratos**: Suma de todos los carbohidratos (texto en morado)
  - Lácteos + Frutas + Verduras + Leguminosas + Azúcares + Cereales + Líp+proteína
- **Proteínas**: Suma de todas las proteínas (texto en rojo)
  - Lácteos + Verduras + Leguminosas + Cereales + AOAMB + AOAB + AOAM + Líp+proteína
- **Lípidos**: Suma de todos los lípidos (texto en naranja)
  - Lácteos + Leguminosas + AOAMB + AOAB + AOAM + Líp+proteína + Lípidos
- **Calorías**: Suma de todas las calorías (texto en verde)
  - Todas las filas × sus respectivos valores calóricos

---

## Tabla Macronutrientes (Calorias Totales y Modo Fit)

### Cálculos Base
```javascript
totalCarbs = (Lácteos × 12) + (Frutas × 15) + (Verduras × 4) + 
             (Leguminosas × 20) + (Azúcares × 10) + (Cereales × 15) + 
             (Líp+proteína × 2)

totalProteins = (Lácteos × 9) + (Verduras × 2) + (Leguminosas × 8) + 
                (Cereales × 2) + (AOAMB × 7) + (AOAB × 7) + 
                (AOAM × 7) + (Líp+proteína × 2)

totalLipids = (Lácteos × 2) + (Leguminosas × 1) + (AOAMB × 1) + 
              (AOAB × 3) + (AOAM × 5) + (Líp+proteína × 5) + 
              (Lípidos × 5)
```

### Calorías Totales (Primera Sección)
- **Carbohidratos**:
  - Calorías: `totalCarbs × 4`
  - Gramos: `totalCarbs`
- **Proteínas**:
  - Calorías: `totalProteins × 4`
  - Gramos: `totalProteins`
- **Lípidos**:
  - Calorías: `totalLipids × 9`
  - Gramos: `totalLipids`
- **Total**:
  - Calorías: `(totalCarbs × 4) + (totalProteins × 4) + (totalLipids × 9)`

### Modo Fit (Segunda Sección)
- **Carbohidratos**:
  - Cal: `totalCarbs × 4` (mismo valor que Calorías Totales)
  - G: `totalCarbs` (mismo valor que Gramos)
- **Proteínas**:
  - Cal: `totalProteins × 4` (mismo valor que Calorías Totales)
  - G: `(Lácteos × 9) + (Leguminosas × 8) + (AOAMB × 7) + (AOAB × 7) + (AOAM × 7)` **(Solo alimentos específicos)**
- **Lípidos**:
  - Cal: `totalLipids × 9` (mismo valor que Calorías Totales)
  - G: `totalLipids` (mismo valor que Gramos)
- **Total**:
  - Cal: `(totalCarbs × 4) + (totalProteins × 4) + (totalLipids × 9)`

### Factores de Conversión
- **Carbohidratos**: 1 gramo = 4 calorías
- **Proteínas**: 1 gramo = 4 calorías
- **Lípidos**: 1 gramo = 9 calorías

---

## Notas Importantes

1. **Todos los cálculos son reactivos**: Se actualizan automáticamente cuando cambian los datos del menú en `grupoAlimenticioData`

2. **División por 7**: Los valores en `grupoAlimenticioData` se dividen por 7 para calcular equivalentes (probablemente representa distribución semanal)

3. **Modo Fit - Proteínas G**: Es el único valor que difiere entre "Calorías Totales" y "Modo Fit", incluyendo solo fuentes proteicas específicas (Leche descremada, Leguminosas, y alimentos de origen animal)

4. **Colores en la fila Total de Macros**: Cada valor total usa el color correspondiente a su header (morado para carbohidratos, rojo para proteínas, naranja para lípidos, verde para calorías)
