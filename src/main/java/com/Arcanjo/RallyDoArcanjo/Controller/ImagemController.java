package com.Arcanjo.RallyDoArcanjo.Controller;

import java.io.IOException;
import java.nio.file.Files;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/static/imagem")
public class ImagemController {

    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        try {
            Resource resource = new ClassPathResource("static/imagem/" + filename);
            byte[] imageBytes = Files.readAllBytes(resource.getFile().toPath());
            
            // Determina o tipo de mídia com base na extensão do arquivo
            MediaType contentType = MediaType.IMAGE_JPEG;
            if (filename.toLowerCase().endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG;
            }

            return ResponseEntity
                .ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .contentType(contentType)
                .body(imageBytes);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> options() {
        return ResponseEntity
            .ok()
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Methods", "GET, OPTIONS")
            .header("Access-Control-Allow-Headers", "*")
            .build();
    }
}