package com.fintrack.service;

import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public byte[] generateMonthlyReport(String email, int month, int year) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        user.getId(), start, end);

        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                user.getId(), "INCOME", start, end);
        BigDecimal totalExpenses = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                user.getId(), "EXPENSE", start, end);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = new Font(Font.HELVETICA, 22, Font.BOLD, new Color(10, 15, 30));
            Paragraph title = new Paragraph("FinTrack Financial Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);

            // Period
            Font subFont = new Font(Font.HELVETICA, 12, Font.NORMAL, new Color(100, 116, 139));
            String period = start.format(DateTimeFormatter.ofPattern("MMMM yyyy"));
            Paragraph periodPara = new Paragraph("Period: " + period, subFont);
            periodPara.setAlignment(Element.ALIGN_CENTER);
            periodPara.setSpacingAfter(5);
            document.add(periodPara);

            // User info
            Paragraph userPara = new Paragraph("Prepared for: " + user.getFullName() + " (" + user.getEmail() + ")", subFont);
            userPara.setAlignment(Element.ALIGN_CENTER);
            userPara.setSpacingAfter(20);
            document.add(userPara);

            // Summary
            Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(99, 102, 241));
            document.add(new Paragraph("Summary", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(60);
            summaryTable.setHorizontalAlignment(Element.ALIGN_LEFT);

            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(30, 41, 59));
            Font valueFont = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(30, 41, 59));

            addSummaryRow(summaryTable, "Total Income", user.getCurrency() + " " + totalIncome.toPlainString(), labelFont, new Font(Font.HELVETICA, 11, Font.BOLD, new Color(16, 185, 129)));
            addSummaryRow(summaryTable, "Total Expenses", user.getCurrency() + " " + totalExpenses.toPlainString(), labelFont, new Font(Font.HELVETICA, 11, Font.BOLD, new Color(239, 68, 68)));
            BigDecimal net = totalIncome.subtract(totalExpenses);
            Color netColor = net.compareTo(BigDecimal.ZERO) >= 0 ? new Color(16, 185, 129) : new Color(239, 68, 68);
            addSummaryRow(summaryTable, "Net Balance", user.getCurrency() + " " + net.toPlainString(), labelFont, new Font(Font.HELVETICA, 11, Font.BOLD, netColor));

            document.add(summaryTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // Transactions table
            document.add(new Paragraph("Transactions", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 3.5f, 2f, 1.5f, 2f});

            // Table headers
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Color headerBg = new Color(99, 102, 241);
            addTableHeader(table, "Date", headerFont, headerBg);
            addTableHeader(table, "Description", headerFont, headerBg);
            addTableHeader(table, "Category", headerFont, headerBg);
            addTableHeader(table, "Type", headerFont, headerBg);
            addTableHeader(table, "Amount (" + user.getCurrency() + ")", headerFont, headerBg);

            // Table rows
            Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(30, 41, 59));
            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");

            for (Transaction t : transactions) {
                addTableCell(table, t.getTransactionDate().format(dateFmt), cellFont);
                addTableCell(table, t.getDescription() != null ? t.getDescription() : "-", cellFont);
                addTableCell(table, t.getCategory() != null ? t.getCategory().getName() : "Uncategorized", cellFont);

                Font typeFont = new Font(Font.HELVETICA, 9, Font.BOLD,
                        "INCOME".equals(t.getType()) ? new Color(16, 185, 129) : new Color(239, 68, 68));
                addTableCell(table, t.getType(), typeFont);
                addTableCell(table, t.getAmount().toPlainString(), cellFont);
            }

            document.add(table);

            // Footer
            document.add(new Paragraph(" "));
            Font footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC, new Color(148, 163, 184));
            Paragraph footer = new Paragraph("Generated by FinTrack on " + LocalDate.now().format(dateFmt), footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }

        return out.toByteArray();
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, labelFont));
        c1.setBorder(0);
        c1.setPadding(5);
        table.addCell(c1);
        PdfPCell c2 = new PdfPCell(new Phrase(value, valueFont));
        c2.setBorder(0);
        c2.setPadding(5);
        table.addCell(c2);
    }

    private void addTableHeader(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setBorderColor(new Color(226, 232, 240));
        table.addCell(cell);
    }
}
