package real_estate.crm.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "units")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String unitNumber;

    @Column(nullable = false)
    private String unitType;

    @Column(nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitStatus status;

    @ManyToOne(optional = false)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    public Unit() {
    }

    public Unit(
            String unitNumber,
            String unitType,
            BigDecimal price,
            UnitStatus status,
            Building building) {

        this.unitNumber = unitNumber;
        this.unitType = unitType;
        this.price = price;
        this.status = status;
        this.building = building;
    }

    public Long getId() {
        return id;
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public String getUnitType() {
        return unitType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public UnitStatus getStatus() {
        return status;
    }

    public Building getBuilding() {
        return building;
    }

    public void setUnitNumber(String unitNumber) {
        this.unitNumber = unitNumber;
    }

    public void setUnitType(String unitType) {
        this.unitType = unitType;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setStatus(UnitStatus status) {
        this.status = status;
    }

    public void setBuilding(Building building) {
        this.building = building;
    }
}