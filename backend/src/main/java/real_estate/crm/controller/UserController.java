package real_estate.crm.controller;

import real_estate.crm.dto.SalesEmployeeResponse;
import real_estate.crm.entity.Role;
import real_estate.crm.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/sales-employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<List<SalesEmployeeResponse>>
    getSalesEmployees() {

        List<SalesEmployeeResponse> employees =
                userRepository
                        .findByRole(Role.SALES_EMPLOYEE)
                        .stream()
                        .map(SalesEmployeeResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(employees);
    }
}