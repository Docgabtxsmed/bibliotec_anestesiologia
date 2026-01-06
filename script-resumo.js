// ========================================
// NAVEGAÇÃO SUAVE E ATUALIZAÇÃO DO MENU
// Autor: Biblioteca de Anestesiologia
// ========================================

/**
 * FUNÇÃO 1: NAVEGAÇÃO SUAVE AO CLICAR
 * Quando você clica em um link da sidebar, rola suavemente até a seção
 */
document.querySelectorAll('.sidebar-nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Previne o comportamento padrão (pular instantaneamente)
        e.preventDefault();
        
        // Pega o ID da seção alvo (ex: "#secao1")
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        // Se a seção existe, rola até ela
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',  // Rolagem suave
                block: 'start'       // Alinha no início
            });
            
            // Remove a classe 'active' de todos os links
            document.querySelectorAll('.sidebar-nav a').forEach(a => {
                a.classList.remove('active');
            });
            
            // Adiciona 'active' ao link clicado
            this.classList.add('active');
        }
    });
});

/**
 * FUNÇÃO 2: ATUALIZA MENU CONFORME VOCÊ ROLA
 * Detecta qual seção está visível e marca o link correspondente
 */
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('.section');
    
    // Para cada seção, verifica se está visível
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // Se você rolou até essa seção (com margem de 200px)
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    // Atualiza os links da sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        a.classList.remove('active');
        
        // Se o link aponta para a seção atual, marca como active
        if (a.getAttribute('href') === `#${current}`) {
            a.classList.add('active');
        }
    });
});