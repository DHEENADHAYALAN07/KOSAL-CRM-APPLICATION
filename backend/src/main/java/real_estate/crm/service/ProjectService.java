package real_estate.crm.service;

import real_estate.crm.entity.Project;
import real_estate.crm.exception.ResourceNotFoundException;
import real_estate.crm.repository.ProjectRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(
            ProjectRepository projectRepository
    ) {
        this.projectRepository =
                projectRepository;
    }

    public Project createProject(
            Project project
    ) {
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(
            Long id
    ) {
        return projectRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Project not found with id: "
                                        + id
                        )
                );
    }

    public Project updateProject(
            Long id,
            Project updatedProject
    ) {
        Project existingProject =
                getProjectById(id);

        existingProject.setName(
                updatedProject.getName()
        );

        existingProject.setLocation(
                updatedProject.getLocation()
        );

        return projectRepository.save(
                existingProject
        );
    }

    public void deleteProject(
            Long id
    ) {
        Project project =
                getProjectById(id);

        projectRepository.delete(project);
    }
}