package com.Arcanjo.RallyDoArcanjo.domain.Equipes;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity(name = "equipes")
@Table(name = "equipes")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Equipes {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome_da_equipe;

    private String nome_do_lider;

    private String foto_do_lider;

    private int ponto;

    private String bloco;

    public Equipes(EquipesRequestDTO data){
        this.nome_da_equipe = data.nome_da_equipe();
        this.nome_do_lider = data.nome_do_lider();
        this.foto_do_lider = data.foto_do_lider();
        this.ponto = data.ponto();
        this.bloco = data.bloco();
    }
}
