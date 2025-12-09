# Database Reset Guide

## How to Delete and Reset the Database

The database file is stored in your system's user data directory. To reload the initial data with the updated ingredient tipos, you need to delete the existing database file.

### Method 1: Manual Deletion (Recommended)

#### On Windows:
1. Close the application completely
2. Navigate to: `%APPDATA%\calorimetric-electron-desk\`
   - Or paste this in File Explorer address bar: `%APPDATA%\calorimetric-electron-desk\`
3. Delete the file: `calorimetric.db`
4. Restart the application

**Full path example:**
```
C:\Users\YourUsername\AppData\Roaming\calorimetric-electron-desk\calorimetric.db
```

#### On macOS:
1. Close the application completely
2. Navigate to: `~/Library/Application Support/calorimetric-electron-desk/`
3. Delete the file: `calorimetric.db`
4. Restart the application

**Full path example:**
```
/Users/YourUsername/Library/Application Support/calorimetric-electron-desk/calorimetric.db
```

#### On Linux:
1. Close the application completely
2. Navigate to: `~/.config/calorimetric-electron-desk/`
3. Delete the file: `calorimetric.db`
4. Restart the application

**Full path example:**
```
/home/YourUsername/.config/calorimetric-electron-desk/calorimetric.db
```

### Method 2: Using PowerShell (Windows)

```powershell
# Stop the app first, then run:
Remove-Item "$env:APPDATA\calorimetric-electron-desk\calorimetric.db" -Force
```

### Method 3: Programmatic Deletion (For Development)

You can add a developer menu option to reset the database:

1. Add to `src/main/main.ts` menu:
```typescript
{
  label: 'Reset Database',
  click: () => {
    const { dialog } = require('electron');
    dialog.showMessageBox({
      type: 'warning',
      buttons: ['Cancel', 'Reset'],
      title: 'Reset Database',
      message: 'This will delete all data and reload initial data. Continue?',
    }).then(result => {
      if (result.response === 1) {
        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(app.getPath('userData'), 'calorimetric.db');
        
        closeDatabase();
        fs.unlinkSync(dbPath);
        
        app.relaunch();
        app.exit();
      }
    });
  }
}
```

## What Happens After Deletion?

When you restart the app after deleting the database:

1. A new `calorimetric.db` file will be created automatically
2. All tables will be recreated with the current schema
3. Initial data will be seeded:
   - **9 TipoIngrediente** (Lácteos, Animales, Leguminosas, Verduras, Cereales, Frutas, Lípidos, Líp+proteína, Azúcares)
   - **100+ Ingredientes** with their respective tipo assignments
   - **12 sample recipes** with ingredients
   - **3 Tiempos** (Desayuno, Comida, Cena)

## Updated Initial Data

The new seed includes:

### Ingredient Categories:
- **Lácteos**: 5 items (leche, yogurt, quesos, crema)
- **Animales**: 13 items (pollo, pescado, atún, camarón, huevos, carne)
- **Leguminosas**: 5 items (frijoles negros, refritos, lentejas, garbanzos, pintos)
- **Verduras**: 20 items (espinacas, tomate, cebolla, nopales, col, etc.)
- **Cereales**: 10 items (quinoa, tortillas, pan integral, arroz, avena, etc.)
- **Frutas**: 10 items (aguacate, limón, mango, plátano, manzana, etc.)
- **Lípidos**: 3 items (aceites)
- **Líp+proteína**: 5 items (pepitas, nueces, almendras, cacahuates, chía)
- **Azúcares**: 2 items (miel, azúcar mascabado)
- **Sin tipo**: Condimentos y especias

### Sample Recipes:
All 12 recipes include properly categorized ingredients with colors.

## Troubleshooting

### Database file not found
- The database is created on first run
- Check the console logs for the actual path being used

### Permission denied
- Make sure the app is completely closed
- Run PowerShell/Terminal as administrator if needed

### Data not reloading
- Check console logs for errors
- The seed function only runs if no recipes exist
- Ensure the file was completely deleted before restarting

## Verification

After restarting, verify the data loaded correctly:
1. Open "Lista de Ingredientes" (Ctrl+L)
2. Check that ingredients have colored tipo badges
3. Open "Recetario" and verify recipes show colored ingredient tags
4. Try loading a recipe into a menu and verify colors transfer correctly
