package real_estate.crm.dto;

public class DashboardResponse {

    // =========================================================
    // LEAD COUNTS
    // =========================================================

    private long totalLeads;
    private long newLeads;
    private long contactedLeads;
    private long siteVisitLeads;
    private long interestedLeads;
    private long negotiationLeads;
    private long bookedLeads;
    private long lostLeads;


    // =========================================================
    // UNIT COUNTS
    // =========================================================

    private long totalUnits;
    private long availableUnits;
    private long bookedUnits;


    // =========================================================
    // BOOKING COUNTS
    // =========================================================

    private long totalBookings;
    private long activeBookings;
    private long cancelledBookings;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public DashboardResponse() {
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }


    public long getNewLeads() {
        return newLeads;
    }

    public void setNewLeads(long newLeads) {
        this.newLeads = newLeads;
    }


    public long getContactedLeads() {
        return contactedLeads;
    }

    public void setContactedLeads(long contactedLeads) {
        this.contactedLeads = contactedLeads;
    }


    public long getSiteVisitLeads() {
        return siteVisitLeads;
    }

    public void setSiteVisitLeads(long siteVisitLeads) {
        this.siteVisitLeads = siteVisitLeads;
    }


    public long getInterestedLeads() {
        return interestedLeads;
    }

    public void setInterestedLeads(long interestedLeads) {
        this.interestedLeads = interestedLeads;
    }


    public long getNegotiationLeads() {
        return negotiationLeads;
    }

    public void setNegotiationLeads(long negotiationLeads) {
        this.negotiationLeads = negotiationLeads;
    }


    public long getBookedLeads() {
        return bookedLeads;
    }

    public void setBookedLeads(long bookedLeads) {
        this.bookedLeads = bookedLeads;
    }


    public long getLostLeads() {
        return lostLeads;
    }

    public void setLostLeads(long lostLeads) {
        this.lostLeads = lostLeads;
    }


    public long getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(long totalUnits) {
        this.totalUnits = totalUnits;
    }


    public long getAvailableUnits() {
        return availableUnits;
    }

    public void setAvailableUnits(long availableUnits) {
        this.availableUnits = availableUnits;
    }


    public long getBookedUnits() {
        return bookedUnits;
    }

    public void setBookedUnits(long bookedUnits) {
        this.bookedUnits = bookedUnits;
    }


    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }


    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }


    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }
}