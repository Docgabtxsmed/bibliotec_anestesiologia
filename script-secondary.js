// ============================================
// SCRIPT-SECONDARY.JS
// Biblioteca de Anestesiologia - Academia MedTech
// ============================================
//
// JavaScript para páginas secundárias do projeto.
// Fornece funcionalidades de interação, acessibilidade
// e animações para páginas de especialidades.
//
// Uso: <script src="script-secondary.js"></script>
// ============================================

/**
 * INICIALIZAÇÃO
 * Executa quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    initKeyboardNavigation();
    initDisabledCards();
    initLogoNavigation();
    initScrollAnimations();
});

/**
 * FUNCIONALIDADE 1: NAVEGAÇÃO POR TECLADO
 * Permite navegar pelos cards usando Enter/Space
 */
function initKeyboardNavigation() {
    const cards = document.querySelectorAll('.component-card:not(.card-disabled)');
    
    cards.forEach(card => {
        // Adiciona tabindex se não tiver
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
        
        // Navegação por teclado
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * FUNCIONALIDADE 2: CARDS DESABILITADOS (EM BREVE)
 * Mostra notificação ao clicar em cards desabilitados
 */
function initDisabledCards() {
    const disabledCards = document.querySelectorAll('.card-disabled');
    
    disabledCards.forEach(card => {
        // Adiciona tabindex e aria-disabled
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-disabled', 'true');
        
        // Evento de clique
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showNotification('Em Breve', 'Este conteúdo estará disponível em breve! 🚀');
        });
        
        // Navegação por teclado
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showNotification('Em Breve', 'Este conteúdo estará disponível em breve! 🚀');
            }
        });
    });
}

/**
 * FUNCIONALIDADE 3: LOGO CLICÁVEL COM TECLADO
 * Permite navegar para index.html usando Enter/Space no logo
 */
function initLogoNavigation() {
    const logo = document.querySelector('.logo');
    
    if (logo) {
        // Adiciona tabindex se não tiver
        if (!logo.hasAttribute('tabindex')) {
            logo.setAttribute('tabindex', '0');
        }
        
        // Adiciona aria-label
        logo.setAttribute('aria-label', 'Voltar para a página inicial');
        logo.setAttribute('role', 'button');
        
        // Navegação por teclado
        logo.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = 'index.html';
            }
        });
    }
}

/**
 * FUNCIONALIDADE 4: ANIMAÇÕES AO SCROLL
 * Adiciona animações aos cards quando aparecem na viewport
 */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.component-card');
    
    // Verifica se o navegador suporta IntersectionObserver
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(el => {
            // Reset da animação inicial
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    } else {
        // Fallback para navegadores antigos
        elements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
}

/**
 * FUNCIONALIDADE 5: SISTEMA DE NOTIFICAÇÃO
 * Cria notificações temporárias na tela
 * 
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem da notificação
 * @param {number} duration - Duração em ms (padrão: 3000)
 */
function showNotification(title, message, duration = 3000) {
    // Remove notificação existente se houver
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <strong>${escapeHtml(title)}</strong>
                <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()" aria-label="Fechar notificação">×</button>
            </div>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove automaticamente após duração especificada
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
}

/**
 * UTILIDADE: ESCAPE HTML
 * Previne XSS ao inserir conteúdo em notificações
 * 
 * @param {string} text - Texto a ser escapado
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * FUNCIONALIDADE 6: SMOOTH SCROLL PARA LINKS ÂNCORA
 * Implementa scroll suave para links internos
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Ignora links vazios ou só com #
        if (href === '#' || href === '') {
            e.preventDefault();
            return;
        }
        
        const targetElement = document.querySelector(href);
        
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Atualiza URL sem recarregar
            history.pushState(null, null, href);
        }
    });
});

/**
 * FUNCIONALIDADE 7: DETECÇÃO DE CARDS EXTERNOS
 * Adiciona ícone visual para links externos
 */
document.querySelectorAll('.component-card a[href^="http"]').forEach(link => {
    // Adiciona atributo para abrir em nova aba
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    
    // Adiciona ícone de link externo (opcional)
    const icon = document.createElement('span');
    icon.textContent = ' ↗';
    icon.setAttribute('aria-label', 'Abre em nova aba');
    link.appendChild(icon);
});

/**
 * FUNCIONALIDADE 8: PERFORMANCE - DEBOUNCE
 * Função auxiliar para otimizar eventos frequentes
 * 
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} - Função com debounce aplicado
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * FUNCIONALIDADE 9: LOG DE EVENTOS (DESENVOLVIMENTO)
 * Descomente para debug durante desenvolvimento
 */
/*
console.log('🚀 Script Secondary carregado com sucesso!');
console.log('📊 Cards encontrados:', document.querySelectorAll('.component-card').length);
console.log('🚫 Cards desabilitados:', document.querySelectorAll('.card-disabled').length);
*/

// ============================================
// FIM
// ============================================

