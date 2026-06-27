package com.expensetracker.util;

import com.expensetracker.dto.ExpenseDto;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

@Slf4j
public class CsvExportUtil {

    public static ByteArrayInputStream expensesToCSV(List<ExpenseDto> expenses) {
        String[] headers = {"Expense ID", "Title", "Amount", "Date", "Category", "Payment Method", "Notes"};

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(out)) {

            // Write CSV Header
            writer.println(String.join(",", headers));

            // Write CSV Data Rows
            for (ExpenseDto expense : expenses) {
                String notesEscaped = expense.getNotes() != null ? "\"" + expense.getNotes().replace("\"", "\"\"") + "\"" : "";
                String titleEscaped = "\"" + expense.getTitle().replace("\"", "\"\"") + "\"";
                String data = String.format("%d,%s,%.2f,%s,%s,%s,%s",
                        expense.getExpenseId(),
                        titleEscaped,
                        expense.getAmount(),
                        expense.getExpenseDate().toString(),
                        expense.getCategoryName(),
                        expense.getPaymentMethod(),
                        notesEscaped
                );
                writer.println(data);
            }

            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Error creating CSV export: {}", e.getMessage());
            throw new RuntimeException("Fail to import data to CSV file: " + e.getMessage());
        }
    }
}
