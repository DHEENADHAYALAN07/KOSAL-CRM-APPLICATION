package real_estate.crm.controller;

import real_estate.crm.entity.Building;
import real_estate.crm.service.BuildingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    // CREATE BUILDING
    @PostMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Building> createBuilding(
            @PathVariable Long projectId,
            @RequestBody Building building) {

        return ResponseEntity.ok(
                buildingService.createBuilding(projectId, building)
        );
    }

    // GET ALL BUILDINGS
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<List<Building>> getAllBuildings() {

        return ResponseEntity.ok(
                buildingService.getAllBuildings()
        );
    }

    // GET BUILDING BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<Building> getBuildingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                buildingService.getBuildingById(id)
        );
    }

    // UPDATE BUILDING
    @PutMapping("/{id}/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Building> updateBuilding(
            @PathVariable Long id,
            @PathVariable Long projectId,
            @RequestBody Building building) {

        return ResponseEntity.ok(
                buildingService.updateBuilding(
                        id,
                        projectId,
                        building
                )
        );
    }

    // DELETE BUILDING
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteBuilding(
            @PathVariable Long id) {

        buildingService.deleteBuilding(id);

        return ResponseEntity.ok(
                "Building deleted successfully"
        );
    }
}