package real_estate.crm.dto;

import real_estate.crm.entity.LeadStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class LeadRequest {

    @NotBlank(message = "Name is required")
    @Size(
            min = 2,
            max = 100,
            message = "Name must be between 2 and 100 characters"
    )
    private String name;


    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;


    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Phone number must be a valid 10-digit Indian mobile number"
    )
    private String phone;


    @NotBlank(message = "Property type is required")
    @Size(
            max = 50,
            message = "Property type cannot exceed 50 characters"
    )
    private String propertyType;


    private LeadStatus status;


    @Valid
    private AssignedUserRequest assignedTo;


    @Size(
            max = 1000,
            message = "Notes cannot exceed 1000 characters"
    )
    private String notes;


    @FutureOrPresent(
            message = "Follow-up date cannot be in the past"
    )
    private LocalDate followUpDate;


    public LeadRequest() {
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }


    public LeadStatus getStatus() {
        return status;
    }

    public void setStatus(LeadStatus status) {
        this.status = status;
    }


    public AssignedUserRequest getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(
            AssignedUserRequest assignedTo) {

        this.assignedTo = assignedTo;
    }


    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }


    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(
            LocalDate followUpDate) {

        this.followUpDate = followUpDate;
    }
}