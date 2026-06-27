package com.expensetracker.service;

import com.expensetracker.dto.DashboardDto;
import com.expensetracker.dto.ReportDto;

public interface ReportService {
    DashboardDto getDashboardData();
    ReportDto getReportData();
}
