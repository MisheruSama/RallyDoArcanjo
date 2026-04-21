package com.Arcanjo.RallyDoArcanjo.domain.Equipes;

public record EquipesResponseDTO(Long id, String nome_da_equipe, String nome_do_lider, String foto_do_lider, int ponto, String bloco) {

    public EquipesResponseDTO(Equipes equipes){
        this(equipes.getId(), equipes.getNome_da_equipe(), equipes.getNome_do_lider(), equipes.getFoto_do_lider(), equipes.getPonto(), equipes.getBloco());
    }
}
