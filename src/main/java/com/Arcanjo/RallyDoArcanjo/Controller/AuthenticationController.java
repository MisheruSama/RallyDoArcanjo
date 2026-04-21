package com.Arcanjo.RallyDoArcanjo.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Arcanjo.RallyDoArcanjo.domain.User.AuthenticationDTO;
import com.Arcanjo.RallyDoArcanjo.domain.User.LoginResponseDTO;
import com.Arcanjo.RallyDoArcanjo.domain.User.RegisterDTO;
import com.Arcanjo.RallyDoArcanjo.domain.User.User;
import com.Arcanjo.RallyDoArcanjo.infra.security.TokenService;
import com.Arcanjo.RallyDoArcanjo.repositories.UserRepository;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository  repository;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data){
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(),data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((User) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid RegisterDTO data){
        if(this.repository.findByLogin(data.login()) != null) return ResponseEntity.badRequest().build();

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        User newUser = new User(data.nome(), data.login(), encryptedPassword, data.role());

        this.repository.save(newUser);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }

        String username = auth.getName();
        var authorities = auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();

        String nome = null;
        Object principal = auth.getPrincipal();
        if (principal instanceof User) {
            nome = ((User) principal).getNome();
        }

        return ResponseEntity.ok(Map.of("login", username, "nome", nome, "authorities", authorities));
    }
}
