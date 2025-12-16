import { dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, AlignmentType, TextRun, ExternalHyperlink, ShadingType, VerticalAlign, PageOrientation } from 'docx';

interface MenuItem {
  cantidad: string;
  nombre: string;
  recipeId?: number;
}

interface MenuTableData {
  title: string;
  items: MenuItem[];
  headerColor: 'green' | 'pink';
  recipeTitle?: string;
  recipeLink?: string;
}

export async function exportMenuToWord(menuTables: MenuTableData[], menuNombre: string): Promise<void> {
  try {
    // Show save dialog
    const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow()!, {
      title: 'Exportar Menú',
      defaultPath: `${menuNombre || 'Menu'}.docx`,
      filters: [
        { name: 'Word Documents', extensions: ['docx'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return;
    }

    // Create document sections
    const documentSections: (Paragraph | Table)[] = [];

    // Add title and description
    documentSections.push(
      new Paragraph({
        text: menuNombre || 'Plan Nutricional',
        heading: 'Heading1',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: 'Este documento contiene su plan nutricional detallado. Cada columna representa una opción diferente (I, II, III, IV, V) para cada tiempo de comida.',
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Create the single table
    const tableRows: TableRow[] = [];

    // 1. Main Header Row: I, II, III, IV, V
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];
    tableRows.push(
      new TableRow({
        tableHeader: true,
        children: romanNumerals.map(roman => 
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: roman, bold: true, size: 24 })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: 'E5E7EB' },
            verticalAlign: VerticalAlign.CENTER,
          })
        )
      })
    );

    // 2. Group by 5 (assuming 5 columns per row structure from Dashboard)
    const chunkSize = 5;
    for (let i = 0; i < menuTables.length; i += chunkSize) {
      const chunk = menuTables.slice(i, i + chunkSize);
      
      // Get the Meal Time Name from the first item's title (e.g. "Desayuno I" -> "Desayuno")
      const firstTitle = chunk[0]?.title || '';
      // Remove the Roman numeral at the end to get the base name
      const mealTimeName = firstTitle.replace(/\s+[IV]+$/, '').toUpperCase();
      
      // Determine section color based on headerColor property
      // pink -> light pink, green -> light green
      const sectionColor = chunk[0]?.headerColor === 'pink' ? 'FCE7F3' : 'D1FAE5'; 

      // Row for Meal Time Name (Spanning all 5 columns)
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: mealTimeName, bold: true })],
                alignment: AlignmentType.CENTER
              })],
              columnSpan: 5,
              shading: { type: ShadingType.SOLID, color: sectionColor },
              verticalAlign: VerticalAlign.CENTER,
            })
          ]
        })
      );

      // Row for Items (5 columns side-by-side)
      const itemCells = chunk.map(table => {
        const cellChildren: Paragraph[] = [];

        // Recipe Title
        if (table.recipeTitle) {
          cellChildren.push(
            new Paragraph({
              children: [
                new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: table.recipeTitle,
                      bold: true,
                      italics: true,
                      size: 20,
                      color: "0563C1",
                      underline: {},
                    }),
                  ],
                  link: table.recipeLink || "recipe://0",
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }

        // Ingredients
        table.items.forEach(item => {
          if (item.cantidad || item.nombre) {
             cellChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${item.cantidad || ''} ${item.nombre || ''}`.trim(), size: 20 })
                ],
                spacing: { after: 40 }
              })
            );
          }
        });
        
        // If empty
        if (cellChildren.length === 0) {
             cellChildren.push(new Paragraph({ text: "" }));
        }

        return new TableCell({
          children: cellChildren,
          width: { size: 20, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.TOP,
          margins: { top: 100, bottom: 100, left: 100, right: 100 }
        });
      });

      // Fill up to 5 cells if chunk is smaller (safety)
      while (itemCells.length < 5) {
        itemCells.push(new TableCell({ children: [], width: { size: 20, type: WidthType.PERCENTAGE } }));
      }

      tableRows.push(new TableRow({ children: itemCells }));
    }

    // Build the table
    const menuTable = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" }
      }
    });

    documentSections.push(menuTable);

    // Create document with Landscape orientation
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 720, // 0.5 inch
              bottom: 720,
              left: 720,
              right: 720,
            }
          },
        },
        children: documentSections
      }]
    });

    // Generate and save file
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(result.filePath, buffer);

    console.log(`Menu exported successfully to: ${result.filePath}`);
  } catch (error) {
    console.error('Error exporting menu to Word:', error);
    throw error;
  }
}
