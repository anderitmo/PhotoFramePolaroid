# Backlog do Projeto - PhotoFrame Polaroid

## Registros de Atividades

### [2025-02-23 14:47] - Análise de Viabilidade e Inicialização do Projeto
- **Análise de Viabilidade**: O projeto é 100% viável como SPA Vanilla (HTML5, CSS3, JS). Compatível com hospedagem estática no GitHub Pages sem necessidade de ambiente de build ou Node.js.
- **Escopo Aprovado**:
  1. Captura de imagem via Câmera (WebRTC `getUserMedia`) + Fallback via Upload de arquivo.
  2. Geração de Polaroid em Canvas com cor personalizável da moldura e adição opcional de legenda/texto.
  3. Download da imagem Polaroid processada.
  4. Mural da Sessão com layouts alternáveis: Grade (2x2 / 3x3), Mosaico e Lista/Linha do Tempo.
  5. UI/UX Mobile First, limpa e minimalista.

### [2025-02-23 14:48] - Construção do HTML/CSS (UI/UX SPA)
- Criada a estrutura de navegação e componentes em `index.html`.
- Criado o arquivo `styles.css` com design minimalista, responsivo (Mobile-First), paleta neutra e suporte aos 4 layouts do mural (Grid 2x2, Grid 3x3, Mosaico e Timeline).
- Adicionadas fontes do Google (`Caveat` para legenda tipo escrita à mão em polaroids e `Inter` para a interface).

### [2025-02-23 14:48] - Implementação de Câmera, Canvas, Download e Mural (`app.js`)
- Implementada captura ao vivo da câmera (`navigator.mediaDevices.getUserMedia`) com opção de troca de câmera (frontal/traseira) e espelhamento automático para selfie.
- Implementado suporte a upload de arquivo de imagem do dispositivo como fallback.
- Criador de Polaroid em HTML5 Canvas em alta resolução (1000x1200px) com cálculo automático de proporção e renderização da legenda.
- Seletor de cores pré-definidas e custom picker (`<input type="color">`) com ajuste inteligente da cor do texto (claro/escuro).
- Funcionalidade de download da foto Polaroid no formato PNG.
- Gerenciamento do Mural de Fotos da Sessão com suporte a múltiplos layouts (Grid 2x2, Grid 3x3, Mosaico flexível com rotações aleatórias e Timeline) e remoção individual de fotos.
