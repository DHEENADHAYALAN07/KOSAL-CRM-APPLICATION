package real_estate.crm.controller;

import real_estate.crm.dto.DashboardResponse;
import real_estate.crm.service.DashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;


    public DashboardController(
            DashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }


    // =========================================================
    // GET DASHBOARD
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<DashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                dashboardService.getDashboard()
        );
    }
}