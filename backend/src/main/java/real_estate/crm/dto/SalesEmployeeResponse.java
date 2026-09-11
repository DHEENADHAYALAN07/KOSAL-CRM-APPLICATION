package real_estate.crm.dto;

import real_estate.crm.entity.User;

public class SalesEmployeeResponse {

    private Long id;
    private String name;
    private String email;

    public SalesEmployeeResponse() {
    }

    public SalesEmployeeResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}