// Configuração do Swiper (Carrossel)
let swiper;

document.addEventListener('DOMContentLoaded', function() {
    swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 3,
        initialSlide: 0,
        loop: true,
        loopedSlides: 3,
        speed: 1500,
        allowTouchMove: true,
        observer: true,
        observeParents: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            waitForTransition: false,
            stopOnLastSlide: false
        },
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        }
    });

    // Força o início do autoplay
    swiper.autoplay.start();

    // Reinicia o autoplay quando a página ficar visível
    document.addEventListener("visibilitychange", function() {
        if (!document.hidden) {
            swiper.autoplay.start();
        }
    });

    // Garante que o autoplay continue rodando
    setInterval(function() {
        if (swiper && !swiper.autoplay.running) {
            swiper.autoplay.start();
        }
    }, 2000);
});

// Função para carregar os dados do ranking
function carregarRanking() {
    fetch('/equipes')
        .then(response => response.json())
        .then(equipes => {
            // Ordenar equipes por pontos (maior para menor)
            equipes.sort((a, b) => b.ponto - a.ponto);
            
            const tableBody = document.getElementById('ranking-table-body');
            tableBody.innerHTML = ''; // Limpar tabela antes de adicionar novos dados
            
            equipes.forEach((equipe, index) => {
                const row = document.createElement('tr');
                
                // Adicionar classe especial para os três primeiros lugares
                if (index < 3) {
                    row.classList.add(`position-${index + 1}`);
                }
                
                row.innerHTML = `
                    <td class="text-center">
                        <span class="position-medal ${index < 3 ? `position-${index + 1}` : ''}">
                            ${(index + 1).toString().padStart(2, '0')}º
                        </span>
                    </td>
                    <td class="equipe-cell">
                        <div class="d-flex align-items-center">
                            <img src="${equipe.foto_do_lider}" alt="Foto do líder ${equipe.nome_do_lider}" 
                                class="leader-photo leader-border me-3 rounded-circle"
                                loading="lazy">
                                <div>
                                <div class="fw-bold">${equipe.nome_da_equipe}</div>
                                <small style="color: var(--inv-amarelo)">Líder: ${equipe.nome_do_lider}</small>
                            </div>
                        </div>
                    </td>
                    <td class="text-center fw-bold">
                        ${equipe.ponto.toLocaleString('pt-BR')}
                        ${index === 0 ? '<i class="bi bi-trophy-fill text-warning ms-2"></i>' : ''}
                    </td>
                    <td class="text-center">
                        <img src="${equipe.bloco}"
                             alt="Foto da bloco"
                             class="leader-photo tribe-photo"
                             loading="lazy">
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Erro ao carregar o ranking:', error));
}

// Função para compartilhar o ranking como imagem
async function compartilharRanking() {
    try {
        // Atualizar o botão para mostrar progresso
        const button = document.querySelector('button[onclick="compartilharRanking()"]');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Gerando imagem...';
        button.disabled = true;

        // Criar um container temporário para a captura
        const tempContainer = document.createElement('div');
        tempContainer.style.backgroundColor = '#1A1A1A';
        tempContainer.style.width = '800px';
        
        // Clonar o conteúdo do ranking
        const rankingContent = document.querySelector('.ranking-container').cloneNode(true);

        // Aumentar o tamanho das fotos e texto na imagem compartilhada
        const styleOverrides = document.createElement('style');
        styleOverrides.textContent = `
            .table {
                width: 100% !important;
                border-collapse: collapse !important;
            }
            .leader-photo {
                width: 50px !important;
                height: 50px !important;
                min-width: 50px !important;
                min-height: 50px !important;
                border: 2px solid #F5B21B !important;
            }
            .table td {
                padding: 8px !important;
                vertical-align: middle !important;
                border-bottom: 1px solid #333 !important;
            }
            .table th {
                padding: 8px !important;
                background-color: #333 !important;
            }
            .fw-bold {
                font-weight: bold !important;
            }
            .position-medal {
                font-weight: bold !important;
            }
            small {
                color: #F5B21B !important;
                opacity: 0.8 !important;
            }
            .bi-trophy-fill {
                color: #F5B21B !important;
            }
        `;
        rankingContent.appendChild(styleOverrides);

        // Preparar as imagens para captura
        const images = rankingContent.getElementsByTagName('img');
        Array.from(images).forEach(img => {
            img.crossOrigin = 'anonymous';
        });

        tempContainer.appendChild(rankingContent);
        
        // Adicionar o container temporário ao documento
        document.body.appendChild(tempContainer);

        // Aguardar um momento para garantir que tudo está renderizado
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capturar a imagem com configurações otimizadas
        const canvas = await html2canvas(tempContainer, {
            backgroundColor: '#1A1A1A',
            scale: 4, // Aumentado para 4x para maior qualidade
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: 800,
            height: tempContainer.offsetHeight,
            imageTimeout: 0,
            onclone: function(clonedDoc) {
                Array.from(clonedDoc.images).forEach(img => {
                    img.style.imageRendering = 'pixelated';
                });
            }
        });

        // Remove o container temporário
        document.body.removeChild(tempContainer);

        // Converte o canvas para uma URL de dados PNG para melhor qualidade
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'ranking-rally-das-equipes.png';
        
        // Adicionar à página e clicar
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        alert('Erro ao gerar a imagem do ranking.');
    } finally {
        // Restaurar o botão
        const button = document.querySelector('button[onclick="compartilharRanking()"]');
        button.innerHTML = '<i class="bi bi-share-fill me-2"></i>Compartilhar Ranking';
        button.disabled = false;
    }
}

// Configuração do Swiper para o cronograma
var scheduleSwiper = new Swiper(".scheduleSwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

// Carregar o ranking quando a página carregar
document.addEventListener('DOMContentLoaded', carregarRanking);