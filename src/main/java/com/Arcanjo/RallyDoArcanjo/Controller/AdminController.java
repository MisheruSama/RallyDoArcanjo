package com.Arcanjo.RallyDoArcanjo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminController {
    
    @GetMapping("/admin")
    public String adminHome() {
        return "login.html";
    }
}
