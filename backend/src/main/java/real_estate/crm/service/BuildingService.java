package real_estate.crm.service;

import real_estate.crm.entity.Building;
import real_estate.crm.entity.Project;
import real_estate.crm.exception.ResourceNotFoundException;
import real_estate.crm.repository.BuildingRepository;
import real_estate.crm.repository.ProjectRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final ProjectRepository projectRepository;

    public BuildingService(
            BuildingRepository buildingRepository,
            ProjectRepository projectRepository
    ) {
        this.buildingRepository =
                buildingRepository;

        this.projectRepository =
                projectRepository;
    }

    public Building createBuilding(
            Long projectId,
            Building building
    ) {
        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Project not found with id: "
                                                        + projectId
                                        )
                        );

        building.setProject(project);

        return buildingRepository.save(
                building
        );
    }

    public List<Building> getAllBuildings() {
        return buildingRepository.findAll();
    }

    public Building getBuildingById(
            Long id
    ) {
        return buildingRepository.findById(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Building not found with id: "
                                                + id
                                )
                );
    }

    public Building updateBuilding(
            Long id,
            Long projectId,
            Building updatedBuilding
    ) {
        Building existingBuilding =
                getBuildingById(id);

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Project not found with id: "
                                                        + projectId
                                        )
                        );

        existingBuilding.setName(
                updatedBuilding.getName()
        );

        existingBuilding.setProject(
                project
        );

        return buildingRepository.save(
                existingBuilding
        );
    }

    public void deleteBuilding(
            Long id
    ) {
        Building building =
                getBuildingById(id);

        buildingRepository.delete(
                building
        );
    }
}