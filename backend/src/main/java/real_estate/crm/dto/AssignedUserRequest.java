package real_estate.crm.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class AssignedUserRequest {

    @NotNull(message = "Assigned user ID is required")
    @Positive(message = "Assigned user ID must be greater than 0")
    private Long id;

    public AssignedUserRequest() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}