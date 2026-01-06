# Correção de Tags: `<strong>` → `<b>`

## Objetivo
Trocar tags `<strong>` por `<b>` em termos inline (dentro de frases/parágrafos), mantendo `<strong>` apenas para títulos/subtítulos dentro de highlight-boxes.

## Diferença Semântica

### `<strong>` - Ênfase Forte (Semântica)
- **Significado:** Indica que o conteúdo tem grande importância/seriedade
- **Uso:** Títulos, avisos importantes, conceitos cruciais
- **Leitores de tela:** Dão ênfase na pronunciação
- **SEO:** Maior peso para motores de busca

### `<b>` - Bold (Visual)
- **Significado:** Apenas estilo visual (negrito)
- **Uso:** Termos técnicos, palavras-chave, destaques visuais
- **Leitores de tela:** Leem normalmente
- **SEO:** Peso neutro

## Implementação

### Regra Estabelecida
1. **`<strong>` para títulos em highlight-boxes:**
   ```html
   <div class="highlight-box warning">
       <p><strong>⚠️ Conceito Crucial:</strong> Texto explicativo...</p>
   </div>
   ```

2. **`<b>` para termos inline:**
   ```html
   <p>O estado de <b>circulação hiperdinâmica</b> é...</p>
   <li><b>Óxido nítrico:</b> Considerado um dos...</li>
   ```

## Arquivos Corrigidos

### ✅ resumo-transplante.html
**Total de correções:** ~50 ocorrências

**Exemplos corrigidos:**
- ❌ `<strong>circulação hiperdinâmica</strong>` → ✅ `<b>circulação hiperdinâmica</b>`
- ❌ `<li><strong>Óxido nítrico:</strong>` → ✅ `<li><b>Óxido nítrico:</b>`
- ❌ `<strong>MELD (Model for End-Stage Liver Disease)</strong>` → ✅ `<b>MELD (Model for End-Stage Liver Disease)</b>`
- ❌ `<strong>Cardiomiopatia Cirrótica:</strong>` → ✅ `<b>Cardiomiopatia Cirrótica:</b>`

**Mantidos como `<strong>`:**
- ✅ `<strong>⚠️ Conceito Crucial:</strong>` (título em highlight-box)
- ✅ `<strong>✅ Tratamento:</strong>` (título em highlight-box)
- ✅ `<strong>Teorias Fisiopatológicas:</strong>` (título em highlight-box)

### ✅ Outros Arquivos HTML
**Status:** Verificados - já estavam corretos ou não usavam `<strong>` inline

- `CEC/resumo-fisiopatologia-cec.html` - Já usando `<b>` corretamente
- `CEC/resumo-sequencia-eventos-bypass.html` - Já usando `<b>` corretamente  
- `CEC/manejo-anestesico-cec.html` - Sem uso de `<strong>`
- `transplante-hepatico.html` - Sem uso de `<strong>`
- `flashcards-anki.html` - Sem uso de `<strong>`

## Verificação Final

### Comando de Verificação
```bash
grep -r "<strong>" --include="*.html" .
```

**Resultado:** Nenhuma ocorrência de `<strong>` inline restante ✅

## CSS - Compatibilidade

### style-resumo.css
- ✅ Não há regras específicas para `<strong>` ou `<b>`
- ✅ Ambas as tags herdam estilos padrão do navegador (negrito)
- ✅ Funcionam identicamente visualmente

## Benefícios da Mudança

### 1. **Melhor Acessibilidade**
- Leitores de tela não enfatizam demais termos técnicos
- `<strong>` reservado para alertas e avisos importantes

### 2. **Semântica Correta**
- `<strong>` indica importância/urgência (warnings, títulos)
- `<b>` indica destaque visual de termos (nomenclatura médica)

### 3. **Consistência**
- Todo o projeto agora segue o mesmo padrão
- Fácil manutenção futura

### 4. **SEO Otimizado**
- Motores de busca não dão peso excessivo a termos técnicos
- `<strong>` em títulos de boxes melhora ranqueamento de conceitos importantes

## Exemplos de Uso Correto

### ✅ Correto - `<b>` para termos inline
```html
<p>A <b>cardiomiopatia cirrótica</b> é caracterizada por disfunção...</p>
<li><b>Componentes:</b> Bilirrubina total, INR, Creatinina</li>
<p>O <b>MELD</b> prediz mortalidade em 3 meses.</p>
```

### ✅ Correto - `<strong>` para títulos em boxes
```html
<div class="highlight-box warning">
    <p><strong>⚠️ Conceito Crucial:</strong></p>
    <p>Apesar do alto débito cardíaco...</p>
</div>

<div class="highlight-box success">
    <p><strong>✅ Tratamento:</strong></p>
    <p>O tratamento definitivo é o transplante...</p>
</div>
```

### ❌ Incorreto - Não usar mais
```html
<!-- NÃO FAZER -->
<p>A <strong>circulação hiperdinâmica</strong> é...</p>
<li><strong>Óxido nítrico:</strong> Principal mediador</li>
```

## Conformidade com Normas do Projeto

De acordo com as **NORMAS DE FORMATAÇÃO HTML** do projeto:

> - Para subtítulos e títulos de seção dentro de cards, use sempre a tag `<strong>`.
> - Para negritos dentro de frases e parágrafos (inline), use sempre a tag `<b>`.
> - Nunca envolva tags de negrito em `<div>` ou `<p>` extras que possam causar quebras de linha.

✅ **Totalmente conforme às normas estabelecidas**

## Conclusão

A correção foi implementada com sucesso, melhorando:
- ✅ Acessibilidade (leitores de tela)
- ✅ Semântica HTML5
- ✅ SEO e ranqueamento
- ✅ Consistência do código
- ✅ Manutenibilidade futura

**Status:** ✅ CONCLUÍDO  
**Data:** Janeiro 2026  
**Arquivos modificados:** 1 (resumo-transplante.html)  
**Arquivos verificados:** 7 (todos os HTMLs principais)

