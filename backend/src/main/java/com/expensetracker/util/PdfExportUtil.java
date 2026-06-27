package com.expensetracker.util;

import com.expensetracker.dto.ExpenseDto;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
public class PdfExportUtil {

    public static ByteArrayInputStream expensesToPDF(List<ExpenseDto> expenses) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            titleFont.setColor(new Color(41, 128, 185)); // Sleek blue
            Paragraph title = new Paragraph("Expense Tracker Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Table Structure
            PdfPTable table = new PdfPTable(6); // Title, Category, Date, Method, Amount, Notes
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3.0f, 2.0f, 2.0f, 2.0f, 1.8f, 2.5f});
            table.setSpacingBefore(10);

            // Header Font
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            headFont.setColor(Color.WHITE);

            // Header Cells
            String[] headers = {"Title", "Category", "Date", "Payment Method", "Amount (INR)", "Notes"};
            Color headerBg = new Color(52, 73, 94); // Dark blue-gray

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, headFont));
                cell.setBackgroundColor(headerBg);
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);
            }

            // Data Cells Font
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            BigDecimal totalSum = BigDecimal.ZERO;

            for (ExpenseDto expense : expenses) {
                // Title
                PdfPCell cellTitle = new PdfPCell(new Paragraph(expense.getTitle(), dataFont));
                cellTitle.setPadding(6);
                cellTitle.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cellTitle);

                // Category
                PdfPCell cellCat = new PdfPCell(new Paragraph(expense.getCategoryName(), dataFont));
                cellCat.setPadding(6);
                cellCat.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cellCat);

                // Date
                PdfPCell cellDate = new PdfPCell(new Paragraph(expense.getExpenseDate().toString(), dataFont));
                cellDate.setPadding(6);
                cellDate.setHorizontalAlignment(Element.ALIGN_CENTER);
                cellDate.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cellDate);

                // Payment Method
                PdfPCell cellMethod = new PdfPCell(new Paragraph(expense.getPaymentMethod(), dataFont));
                cellMethod.setPadding(6);
                cellMethod.setHorizontalAlignment(Element.ALIGN_CENTER);
                cellMethod.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cellMethod);

                // Amount
                PdfPCell cellAmount = new PdfPCell(new Paragraph(expense.getAmount().toString(), dataFont));
                cellAmount.setPadding(6);
                cellAmount.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cellAmount.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cellAmount);

                // Notes
                String notes = expense.getNotes() != null ? expense.getNotes() : "";
                PdfPCell cellNotes = new PdfPCell(new Paragraph(notes, dataFont));
                cellNotes.setPadding(6);
                cellNotes.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cellNotes);

                totalSum = totalSum.add(expense.getAmount());
            }

            document.add(table);

            // Add Summary Box at the end
            Paragraph summarySpacing = new Paragraph(" ");
            summarySpacing.setSpacingBefore(15);
            document.add(summarySpacing);

            Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            summaryFont.setColor(new Color(44, 62, 80));
            Paragraph totalParagraph = new Paragraph("Total Spent: Rs. " + totalSum.toString(), summaryFont);
            totalParagraph.setAlignment(Element.ALIGN_RIGHT);
            document.add(totalParagraph);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (DocumentException e) {
            log.error("Error creating PDF export: {}", e.getMessage());
            throw new RuntimeException("Fail to generate PDF: " + e.getMessage());
        }
    }
}
