package real_estate.crm.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    private String propertyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(length = 1000)
    private String notes;

    private LocalDate followUpDate;

    public Lead() {
    }

    public Lead(
            String name,
            String email,
            String phone,
            String propertyType,
            LeadStatus status) {

        this.name = name;
        this.email = email;
        this.phone = phone;
        this.propertyType = propertyType;
        this.status = status;
    }

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

    public LeadStatus getStatus() {
        return status;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
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

    public void setStatus(LeadStatus status) {
        this.status = status;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }
}