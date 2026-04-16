package com.fintrack.controller;

import com.fintrack.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadReport(
            Authentication auth,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();

        byte[] pdfBytes = reportService.generateMonthlyReport(auth.getName(), month, year);

        String filename = "FinTrack_Report_" + year + "_" + String.format("%02d", month) + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
