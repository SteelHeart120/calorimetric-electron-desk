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

    // Create the single table
    const tableRows: TableRow[] = [];

    // 1. Main Header Row: I, II, III, IV, V, VI, VII
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    tableRows.push(
      new TableRow({
        tableHeader: true,
        children: romanNumerals.map(roman => 
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: roman, bold: true, size: 20, font: 'Arial' })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 14.28, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              left: { style: BorderStyle.NIL },
              right: { style: BorderStyle.NIL },
            }
          })
        )
      })
    );

    // 2. Group by 7 (assuming 7 columns per row structure from Dashboard)
    const chunkSize = 7;
    for (let i = 0; i < menuTables.length; i += chunkSize) {
      const chunk = menuTables.slice(i, i + chunkSize);
      
      // Get the Meal Time Name from the first item's title (e.g. "Desayuno I" -> "Desayuno")
      const firstTitle = chunk[0]?.title || '';
      // Remove the Roman numeral at the end to get the base name and format it (Sentence case)
      const rawMealName = firstTitle.replace(/\s+[IV]+$/, '');
      const mealTimeName = rawMealName.charAt(0).toUpperCase() + rawMealName.slice(1).toLowerCase();
      
      // Determine section color based on headerColor property
      // pink -> light pink, green -> #07bc24
      const sectionColor = chunk[0]?.headerColor === 'pink' ? 'EC4899' : '07BC24'; 

      // Row for Meal Time Name (Spanning all 7 columns)
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: mealTimeName, bold: true, size: 20, font: 'Arial', color: 'FFFFFF' })],
                alignment: AlignmentType.CENTER
              })],
              columnSpan: 7,
              shading: { type: ShadingType.SOLID, color: sectionColor },
              verticalAlign: VerticalAlign.CENTER,
            })
          ]
        })
      );

      // Row for Items (7 columns side-by-side)
      const itemCells = chunk.map(table => {
        const cellChildren: Paragraph[] = [];

        // Recipe Title
        if (table.recipeTitle) {
          const titleChildren: (TextRun | ExternalHyperlink)[] = [];
          
          if (table.recipeLink) {
            // Ensure link has protocol
            let link = table.recipeLink;
            if (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('mailto:')) {
              link = 'https://' + link;
            }

            titleChildren.push(
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: table.recipeTitle,
                    bold: true,
                    italics: true,
                    size: 18,
                    font: 'Arial',
                    color: sectionColor,
                    underline: {
                      type: 'single',
                      color: sectionColor,
                    },
                  }),
                ],
                link: link,
              })
            );
          } else {
            titleChildren.push(
              new TextRun({
                text: table.recipeTitle,
                bold: true,
                italics: true,
                size: 18,
                font: 'Arial',
                color: sectionColor,
              })
            );
          }

          cellChildren.push(
            new Paragraph({
              children: titleChildren,
              spacing: { after: 50 },
            })
          );
        }

        // Ingredients
        table.items.forEach(item => {
          if (item.cantidad || item.nombre) {
             cellChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${item.cantidad || ''} ${item.nombre || ''}`.trim(), size: 16, font: 'Arial' })
                ],
                spacing: { after: 20 }
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
          width: { size: 14.28, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.TOP,
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
      });

      // Fill up to 7 cells if chunk is smaller (safety)
      while (itemCells.length < 7) {
        itemCells.push(new TableCell({ children: [], width: { size: 14.28, type: WidthType.PERCENTAGE } }));
      }

      tableRows.push(new TableRow({ children: itemCells }));
    }

    // Build the table
    const menuTable = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
        insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" }
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
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
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

