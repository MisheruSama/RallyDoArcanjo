package com.Arcanjo.RallyDoArcanjo.Controller;

import com.Arcanjo.RallyDoArcanjo.domain.Equipes.Equipes;
import com.Arcanjo.RallyDoArcanjo.repositories.EquipesRepository;
import com.Arcanjo.RallyDoArcanjo.domain.Equipes.EquipesRequestDTO;
import com.Arcanjo.RallyDoArcanjo.domain.Equipes.EquipesResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/equipes")
public class EquipesController {
    @Autowired
    private EquipesRepository repository;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@GetMapping
    public ResponseEntity getAll(){
        List<EquipesResponseDTO> equipesList = this.repository.findAll().stream().map(EquipesResponseDTO::new).toList();
        return ResponseEntity.ok(equipesList);
    }

@CrossOrigin(origins = "*", allowedHeaders = "*")
@PostMapping("/cadastrar")
public void saveEquipe(@RequestBody EquipesRequestDTO data){
    Equipes equipesData = new Equipes(data);
    repository.save(equipesData);
}

@CrossOrigin(origins = "*", allowedHeaders = "*")
@PutMapping("/atualizar/{id}")
public void updateEquipe(@PathVariable Long id, @RequestBody EquipesRequestDTO data){
    if(repository.existsById(id)){
        Equipes equipesData = new Equipes(data);
        equipesData.setId(id);
        repository.save(equipesData);
    }
}

@CrossOrigin(origins = "*", allowedHeaders = "*")
@DeleteMapping("/excluir/{id}")
public void deleteEquipe(@PathVariable Long id){
    if(repository.existsById(id)){
        repository.deleteById(id);
    }
}
}
