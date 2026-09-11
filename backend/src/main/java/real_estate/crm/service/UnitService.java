package real_estate.crm.service;

import real_estate.crm.entity.Building;
import real_estate.crm.entity.Unit;
import real_estate.crm.entity.UnitStatus;
import real_estate.crm.exception.BusinessException;
import real_estate.crm.exception.ResourceNotFoundException;
import real_estate.crm.repository.BuildingRepository;
import real_estate.crm.repository.UnitRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnitService {

    private final UnitRepository unitRepository;
    private final BuildingRepository buildingRepository;

    public UnitService(
            UnitRepository unitRepository,
            BuildingRepository buildingRepository
    ) {
        this.unitRepository =
                unitRepository;

        this.buildingRepository =
                buildingRepository;
    }

    public Unit createUnit(
            Long buildingId,
            Unit unit
    ) {
        Building building =
                buildingRepository.findById(
                        buildingId
                ).orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Building not found with id: "
                                                + buildingId
                                )
                );

        unit.setBuilding(building);

        unit.setStatus(
                UnitStatus.AVAILABLE
        );

        return unitRepository.save(unit);
    }

    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    public Unit getUnitById(
            Long id
    ) {
        return unitRepository.findById(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Unit not found with id: "
                                                + id
                                )
                );
    }

    public Unit updateUnit(
            Long id,
            Unit updatedUnit
    ) {
        Unit existingUnit =
                getUnitById(id);

        existingUnit.setUnitNumber(
                updatedUnit.getUnitNumber()
        );

        existingUnit.setUnitType(
                updatedUnit.getUnitType()
        );

        existingUnit.setPrice(
                updatedUnit.getPrice()
        );

        /*
         * Unit status must not be manually changed.
         * BookingService controls AVAILABLE/BOOKED.
         */
        if (existingUnit.getStatus() == null) {
            existingUnit.setStatus(
                    UnitStatus.AVAILABLE
            );
        }

        return unitRepository.save(
                existingUnit
        );
    }

    public void deleteUnit(
            Long id
    ) {
        Unit unit =
                getUnitById(id);

        if (unit.getStatus() ==
                UnitStatus.BOOKED) {

            throw new BusinessException(
                    "Booked units cannot be deleted"
            );
        }

        unitRepository.delete(unit);
    }
}