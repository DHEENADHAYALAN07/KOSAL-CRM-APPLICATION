package real_estate.crm.controller;

import real_estate.crm.entity.Unit;
import real_estate.crm.service.UnitService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    // CREATE UNIT
    @PostMapping("/building/{buildingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Unit> createUnit(
            @PathVariable Long buildingId,
            @RequestBody Unit unit) {

        return ResponseEntity.ok(
                unitService.createUnit(buildingId, unit)
        );
    }

    // GET ALL
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<List<Unit>> getAllUnits() {

        return ResponseEntity.ok(
                unitService.getAllUnits()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<Unit> getUnitById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                unitService.getUnitById(id)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Unit> updateUnit(
            @PathVariable Long id,
            @RequestBody Unit unit) {

        return ResponseEntity.ok(
                unitService.updateUnit(id, unit)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUnit(
            @PathVariable Long id) {

        unitService.deleteUnit(id);

        return ResponseEntity.ok(
                "Unit deleted successfully"
        );
    }
}