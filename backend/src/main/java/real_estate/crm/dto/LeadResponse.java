package real_estate.crm.dto;

import real_estate.crm.entity.Lead;

import java.time.LocalDate;

public class LeadResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String propertyType;
    private String status;

    private AssignedUserResponse assignedTo;

    private String notes;
    private LocalDate followUpDate;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LeadResponse() {
    }


    public LeadResponse(Lead lead) {

        this.id = lead.getId();
        this.name = lead.getName();
        this.email = lead.getEmail();
        this.phone = lead.getPhone();
        this.propertyType = lead.getPropertyType();

        if (lead.getStatus() != null) {
            this.status = lead.getStatus().name();
        }

        if (lead.getAssignedTo() != null) {

            this.assignedTo =
                    new AssignedUserResponse(
                            lead.getAssignedTo()
                    );
        }

        this.notes = lead.getNotes();
        this.followUpDate = lead.getFollowUpDate();
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public String getStatus() {
        return status;
    }

    public AssignedUserResponse getAssignedTo() {
        return assignedTo;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAssignedTo(
            AssignedUserResponse assignedTo) {

        this.assignedTo = assignedTo;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setFollowUpDate(
            LocalDate followUpDate) {

        this.followUpDate = followUpDate;
    }
}