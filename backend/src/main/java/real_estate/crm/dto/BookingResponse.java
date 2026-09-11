package real_estate.crm.dto;

import real_estate.crm.entity.Booking;
import real_estate.crm.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponse {

    private Long id;

    private Long leadId;
    private String leadName;
    private String leadEmail;
    private String leadPhone;

    private Long unitId;
    private String unitNumber;
    private String unitType;
    private BigDecimal unitPrice;

    private Long buildingId;
    private String buildingName;

    private Long projectId;
    private String projectName;
    private String projectLocation;

    private LocalDateTime bookingDate;
    private BookingStatus status;

    public BookingResponse(Booking booking) {

        this.id = booking.getId();

        this.bookingDate =
                booking.getBookingDate();

        this.status =
                booking.getStatus();

        if (booking.getLead() != null) {

            this.leadId =
                    booking.getLead().getId();

            this.leadName =
                    booking.getLead().getName();

            this.leadEmail =
                    booking.getLead().getEmail();

            this.leadPhone =
                    booking.getLead().getPhone();
        }

        if (booking.getUnit() != null) {

            this.unitId =
                    booking.getUnit().getId();

            this.unitNumber =
                    booking.getUnit().getUnitNumber();

            this.unitType =
                    booking.getUnit().getUnitType();

            this.unitPrice =
                    booking.getUnit().getPrice();

            if (booking.getUnit().getBuilding() != null) {

                this.buildingId =
                        booking.getUnit()
                                .getBuilding()
                                .getId();

                this.buildingName =
                        booking.getUnit()
                                .getBuilding()
                                .getName();

                if (booking.getUnit()
                        .getBuilding()
                        .getProject() != null) {

                    this.projectId =
                            booking.getUnit()
                                    .getBuilding()
                                    .getProject()
                                    .getId();

                    this.projectName =
                            booking.getUnit()
                                    .getBuilding()
                                    .getProject()
                                    .getName();

                    this.projectLocation =
                            booking.getUnit()
                                    .getBuilding()
                                    .getProject()
                                    .getLocation();
                }
            }
        }
    }

    public Long getId() {
        return id;
    }

    public Long getLeadId() {
        return leadId;
    }

    public String getLeadName() {
        return leadName;
    }

    public String getLeadEmail() {
        return leadEmail;
    }

    public String getLeadPhone() {
        return leadPhone;
    }

    public Long getUnitId() {
        return unitId;
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public String getUnitType() {
        return unitType;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public Long getBuildingId() {
        return buildingId;
    }

    public String getBuildingName() {
        return buildingName;
    }

    public Long getProjectId() {
        return projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public String getProjectLocation() {
        return projectLocation;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public BookingStatus getStatus() {
        return status;
    }
}