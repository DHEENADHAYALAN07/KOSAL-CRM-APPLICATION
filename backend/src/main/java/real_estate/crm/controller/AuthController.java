package real_estate.crm.controller;

import real_estate.crm.dto.AuthRequest;
import real_estate.crm.dto.AuthResponse;
import real_estate.crm.entity.Role;
import real_estate.crm.entity.User;
import real_estate.crm.repository.UserRepository;
import real_estate.crm.security.JwtService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request
    ) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        User user =
                userRepository.findByEmail(
                        request.getEmail()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        /*
         * Authentication.getPrincipal() returns Object.
         *
         * JwtService.generateToken() expects UserDetails,
         * so we explicitly cast it here.
         */
        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        String token =
                jwtService.generateToken(
                        userDetails
                );

        AuthResponse response =
                new AuthResponse(
                        token,
                        user.getEmail(),
                        user.getRole().name()
                );

        return ResponseEntity.ok(response);
    }

    /*
     * Only ADMIN users can create sales employee accounts.
     *
     * Public registration is intentionally not allowed because
     * users should not be able to create themselves as ADMIN.
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        if (userRepository.findByEmail(
                request.getEmail()
        ).isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Email is already registered"
                    );
        }

        /*
         * This CRM currently supports creating only
         * SALES_EMPLOYEE accounts through registration.
         */
        User user = new User();

        user.setName(
                request.getName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(
                Role.SALES_EMPLOYEE
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                "Sales employee created successfully"
        );
    }

    /*
     * Request object used when ADMIN creates a
     * new sales employee.
     */
    public static class RegisterRequest {

        @NotBlank(
                message = "Name is required"
        )
        private String name;

        @NotBlank(
                message = "Email is required"
        )
        @Email(
                message = "Please provide a valid email"
        )
        private String email;

        @NotBlank(
                message = "Password is required"
        )
        @Size(
                min = 6,
                message = "Password must contain at least 6 characters"
        )
        private String password;

        public RegisterRequest() {
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

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}