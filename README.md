# Gestão Logística — Rotas e Embarques V5.1

Projeto pronto para VS Code, GitHub e GitHub Pages.

## Formato oficial de importação

A versão V5 foi remapeada com base no arquivo real `espd092.csv`.

Formato suportado como principal:

- `.csv`
- separador `;`
- codificação Windows-1252 ou UTF-8
- números decimais com vírgula
- datas `dd/mm/aaaa`
- horas `HH:MM:SS`

Também continua aceitando `.xlsx` e `.xlsm`.

## Cabeçalho oficial

```text
Cidade;Cliente;Nome;Ped. Sistema;Ped. Repres.;Data Emissao;Item;Descricao;Nat. Op.;Descricao Nat;Repres;Credito;Situacao;Qtd. Atendida;Qtd. Pedida;Vl. Unit. Item;Vl. Tot. Item Aberto;Nome Abrev.;Hora Implant. Pedido;Embarque
```

O arquivo `MODELO_ESPD.csv` incluído no projeto contém esse cabeçalho.

## Mapeamento

| Campo do sistema | Coluna |
|---|---|
| Cidade da entrega | Cidade |
| Código do cliente | Cliente |
| Cliente | Nome |
| Pedido principal | Ped. Sistema |
| Pedido do representante | Ped. Repres. |
| Emissão | Data Emissao |
| Código do produto | Item |
| Produto | Descricao |
| Representante | Repres |
| Crédito | Credito |
| Situação | Situacao |
| Quantidade atendida | Qtd. Atendida |
| Quantidade pedida | Qtd. Pedida |
| Valor unitário | Vl. Unit. Item |
| Valor em aberto | Vl. Tot. Item Aberto |
| Hora de implantação | Hora Implant. Pedido |
| Embarque atual | Embarque |

## Regras confirmadas no `espd092.csv`

- 64.999 linhas físicas no arquivo.
- 3.927 linhas possuem dados úteis.
- 1.028 pedidos únicos.
- 164 cidades.
- 666 clientes.
- Situação: `ABERTO` ou `PARCIAL`.
- Crédito: `APROVADO`, `AVALIADO`, `NAO AVALIADO`, `NAO APROVADO`.
- 154 pedidos estão sem embarque (`Embarque = 0`).

O sistema descarta linhas totalmente vazias automaticamente.

## Como o Embarque é interpretado

`93.738` vira `93738`.

No arquivo analisado, a sequência operacional predominante tem 5 dígitos.
Foram encontrados alguns valores de 7 dígitos, como `9.014.274`; eles são tratados como fora do padrão da sequência e não são usados para decidir o próximo embarque.

O último embarque válido encontrado no arquivo analisado é `93738`, então o próximo seria `93739`.

## Pedidos candidatos a novo embarque

Somente pedidos com:

`Embarque = 0`

são candidatos à criação automática de novo embarque.

Isso evita duplicar pedidos que já estão ligados a um embarque existente.

## Peso

Este formato não contém coluna de peso em kg.

Por isso o software:
- identifica pedido/cidade/rota corretamente;
- identifica pedidos novos;
- não inventa peso;
- mantém a alocação física pendente até existir uma fonte real de peso.

## VS Code

Abra a pasta no VS Code e execute o `index.html` com Live Server, preferencialmente no Chrome ou Edge.

## GitHub

Suba os arquivos para a raiz do repositório. O `index.html` pode ser publicado diretamente no GitHub Pages.

## Regra de dias úteis

O planejamento considera **somente segunda a sexta-feira**.

A entrega planejada é sempre no **próximo dia útil**:

- Segunda → Terça
- Terça → Quarta
- Quarta → Quinta
- Quinta → Sexta
- Sexta → Segunda

**Sábado e domingo são ignorados completamente.**

Exemplo: se o embarque for preparado na sexta-feira, os pedidos analisados serão os das rotas de segunda-feira.

## Dashboard semanal V5.29

A tela principal agora possui uma visão visual de **segunda a sexta**.

Para cada embarque criado são exibidos:

- número do embarque;
- rota e cidades;
- motorista;
- placa;
- pedidos alocados;
- lista dos pedidos;
- ocupação do caminhão em percentual;
- percentual dos pedidos da rota alocados no embarque;
- percentual total da rota já alocado.

### Meta de 80%

A ocupação desejada é **80% ou mais**.

Essa meta **não bloqueia o embarque**. Se uma rota, como Pouso Alegre, tiver todos os pedidos disponíveis alocados e a carga ocupar somente 55% do caminhão, o embarque continua normalmente e aparece como:

`55% • toda carga disponível da rota alocada`

Quando ainda existem pedidos daquela rota a serem alocados, o cartão informa isso separadamente.

O dashboard calcula a semana operacional de segunda a sexta, sempre ignorando sábado e domingo.

## V5.29 — embarque automático por rota

A regra operacional agora é:

1. O sistema identifica o **próximo dia útil** (segunda a sexta).
2. Lê todas as rotas cadastradas para esse dia.
3. Garante **um embarque aberto próprio para cada rota**, usando sempre o próximo número sequencial.
4. Lê o ESPD e considera somente pedidos com `Embarque = 0`.
5. Usa a coluna `Cidade` para encontrar a rota correta.
6. Insere automaticamente o pedido dentro do embarque daquela rota.
7. Quando o ESPD é salvo novamente e surgem novos pedidos da mesma cidade/rota, eles entram no mesmo embarque aberto.
8. Se um embarque for fechado, uma nova sincronização cria o próximo número para aquela rota.

Exemplo:

- Último embarque: `93738`
- Rotas do próximo dia útil: 3
- O sistema cria: `93739`, `93740`, `93741`

Cada pedido é distribuído conforme a cidade cadastrada dentro de cada rota.

### Peso

A falta de peso não impede mais o pedido de entrar no **embarque lógico da rota**.
Quando não existe peso real no ESPD, o dashboard mostra a **porcentagem de pedidos da rota alocados**.

Quando uma fonte de peso real estiver disponível, o sistema também pode mostrar ocupação do caminhão e aplicar a meta de 80%.

## V5.29 — dashboard com detalhamento por dia, cidade e pedido

A tela principal agora funciona em níveis:

### 1. Dashboard semanal
Mostra apenas segunda a sexta, com:
- dia da semana;
- data no formato dia/mês;
- quantidade de embarques;
- quantidade de pedidos;
- cidades atendidas;
- resumo dos primeiros embarques.

Exemplo:
`SEGUNDA • 31/08`

O cartão inteiro do dia é clicável.

### 2. Tela do dia
Ao clicar no dia, abre uma tela com:
- todos os embarques criados naquele dia;
- motorista e placa;
- ocupação / percentual de pedidos;
- todos os pedidos agrupados por **Cidade**;
- números dos embarques usados em cada cidade.

### 3. Detalhe do pedido
Cada pedido é clicável.

O detalhe mostra os itens do pedido:
- Item;
- Descrição;
- Qtd. Pedida;
- Qtd. Atendida;
- Valor unitário;
- Valor aberto;
- Situação;
- Crédito;
- Natureza da operação.

Os itens são salvos junto ao pedido no momento em que ele é alocado, permitindo consultar o conteúdo posteriormente mesmo se o ESPD for atualizado.

## V5.29 — análise inteligente de rotas

Nova aba **Análise de rotas**.

O objetivo é encontrar pedidos de outras rotas que podem complementar um embarque abaixo da meta de ocupação sem prolongar o destino final.

### Como a análise funciona

1. Escolhe um dia útil da semana.
2. Localiza os embarques abaixo da meta (80% por padrão).
3. Identifica pedidos alocados em outros embarques.
4. Resolve a posição geográfica das cidades e salva as coordenadas no navegador.
5. Verifica se a cidade candidata está no corredor entre a origem e os pontos já existentes da rota.
6. A cidade nunca é adicionada depois do último destino.
7. Confere a distância rodoviária da rota original e da rota com a cidade inserida.
8. Só aprova quando o acréscimo está dentro da tolerância configurada.
9. Quando existe peso real, escolhe a combinação de pedidos que mais aproxima o caminhão de 80% sem ultrapassar sua capacidade.
10. Evita retirar pedido de um embarque que já esteja com boa ocupação se a retirada fizer esse embarque cair abaixo da meta.

### Segurança operacional

As recomendações são apenas sugestões. A V5.29 **não move pedidos automaticamente** entre embarques.

O usuário pode revisar:
- pedido;
- cidade;
- embarque de origem;
- embarque recomendado;
- peso;
- ganho de ocupação;
- acréscimo estimado de rota.

### Serviços geográficos

A análise usa, no navegador:
- OpenStreetMap/Nominatim para resolver coordenadas das cidades;
- OSRM para comparar a distância rodoviária.

As coordenadas resolvidas ficam em cache local para reduzir novas consultas.

## V5.29 — embarques clicáveis

A visualização do dashboard foi simplificada.

Fluxo de navegação:

**Semana → Dia → Embarque → Pedido → Itens**

### Tela do dia

A lista de pedidos que ficava abaixo dos cartões foi removida.

Agora a tela mostra somente os **embarques criados**. Cada cartão exibe:
- número do embarque;
- rota;
- cidades;
- motorista;
- placa;
- número de pedidos;
- ocupação / percentual de pedidos alocados.

### Clique no embarque

Ao clicar em um embarque, abre uma janela com:
- motorista;
- placa;
- rota;
- status;
- quantidade de pedidos;
- quantidade de cidades;
- valor aberto total;
- ocupação;
- peso/capacidade quando disponível;
- todos os pedidos dentro daquele embarque.

Os pedidos são agrupados por **cidade**.

### Clique no pedido

Cada pedido continua clicável e abre todos os itens/produtos, quantidades, valores, crédito e situação.

## V5.29 — mapa semanal e antecipação de rotas futuras

A aba **Análise de rotas** agora possui um mapa operacional.

### Mapa semanal

O mapa mostra:
- origem Cooperrita;
- rotas de segunda a sexta;
- cidades de cada rota;
- pedidos sem embarque por cidade;
- oportunidades de pedidos futuros que podem aproveitar uma rota anterior.

As rotas são diferenciadas por dia:
- Segunda: azul
- Terça: roxo
- Quarta: verde
- Quinta: laranja
- Sexta: vermelho

A visualização usa OpenStreetMap. A análise de distância rodoviária continua sendo validada por OSRM.

Para resolver rapidamente os municípios de Minas Gerais, o app consulta uma base pública de municípios brasileiros com latitude/longitude e mantém cache local. Nomes especiais/distritos continuam usando o fallback do Nominatim.

### Pedidos de rotas futuras

Exemplo:
- está sendo montada a rota de segunda;
- existe um pedido sem embarque cuja cidade pertence à rota de terça;
- a cidade de terça está no corredor natural do embarque de segunda;
- a análise rodoviária confirma que a inserção não ultrapassa o desvio permitido.

O app marca o pedido como **ROTA FUTURA** e exibe o botão **Antecipar**.

Ao clicar, o sistema pergunta se o pedido deve ser colocado no embarque atual.

Se confirmado:
- o pedido entra no embarque atual;
- fica marcado com o dia e a rota originais;
- o sistema impede que o mesmo pedido seja criado novamente no planejamento futuro;
- os itens do pedido continuam disponíveis no detalhamento do embarque.

Nenhum pedido futuro é antecipado sem confirmação do usuário.

## V5.29 — leite, derivados e filtros de alocação

A V5.29 classifica cada pedido pelos itens que existem dentro dele.

### Categorias

- `LEITE`: todos os itens são leite.
- `DERIVADOS`: todos os itens são derivados, como queijo, bebida láctea, iogurte, requeijão, manteiga, leite fermentado, creme de leite e similares.
- `LEITE + DERIVADOS`: o mesmo pedido possui leite e derivados, sem outros tipos de produto.
- `MISTO COM OUTROS`: possui leite/derivados junto com produtos de outras famílias.
- `OUTROS`: não possui leite nem derivados.

### Limite de leite puro

Existe a configuração:

`LIMITE DE LEITE PURO POR EMBARQUE (KG)`

- `0` = sem limite específico.
- Um valor como `6500` limita a soma de pedidos classificados como `LEITE` a 6.500 kg por embarque.
- Ao atingir o limite, o sistema abre o próximo embarque da mesma rota.
- O teto de leite não substitui a capacidade física do caminhão.
- Pedidos `LEITE + DERIVADOS` não entram na soma do teto de leite puro.

Se o ESPD não possuir peso real, o sistema continua alocando pela cidade/categoria, mas não consegue validar o teto de kg.

### Filtro de alocação automática

O usuário pode escolher:

- Todos os pedidos
- Somente leite
- Somente derivados
- Somente mistos: leite + derivados
- Leite e derivados em qualquer combinação
- Somente outros produtos

O filtro vale para **novos pedidos**. Ele não remove automaticamente pedidos que já estavam em um embarque.

O mesmo filtro é respeitado nas oportunidades de rotas futuras da análise de rotas.

### Filtro dentro do embarque

Ao abrir um embarque, existe também um filtro visual para mostrar:
- todos;
- somente leite;
- somente derivados;
- leite + derivados;
- todos os laticínios;
- outros.

## V5.29 — regras selecionáveis de alocação

A alocação automática não usa mais um único filtro.

Agora existe uma lista de regras com caixas de seleção.

O sistema só coloca um novo pedido em um embarque quando ele atende a **pelo menos uma regra marcada**.

Se nenhuma regra estiver marcada, **nenhum novo pedido é alocado automaticamente**.

### Peso de corte

Existe um campo configurável, inicialmente em `2.000 kg`.

As opções geradas são:

- Leite — qualquer peso
- Leite — acima do peso de corte
- Leite — até o peso de corte
- Derivados — qualquer peso
- Derivados — acima do peso de corte
- Derivados — até o peso de corte
- Leite + derivados — qualquer peso
- Leite + derivados — acima do peso de corte
- Leite + derivados — até o peso de corte
- Misto com outros
- Outros produtos
- Qualquer categoria — acima do peso de corte

As regras funcionam em lógica **OU**.

Exemplo:
- marcar `LEITE — acima de 2.000 kg`
- marcar `DERIVADOS — qualquer peso`

Nesse caso entram:
- pedidos somente de leite com mais de 2.000 kg;
- qualquer pedido classificado somente como derivados.

Um pedido de leite com 1.500 kg não entra.
Um pedido de outros produtos também não entra.

### Peso ausente

Regra que depende de peso, como `LEITE acima de 2.000 kg`, só pode ser confirmada quando existe peso real em kg.

Se o pedido estiver sem peso:
- ele não atende à regra `acima` nem `até`;
- mas pode atender a `LEITE — qualquer peso`, se essa opção estiver marcada.

### Segurança

Trocar as regras afeta apenas novos pedidos.
O sistema não remove automaticamente pedidos que já estavam alocados.

## V5.29 — recálculo automático ao mudar as regras

As caixas de seleção agora funcionam como regras vivas de montagem.

Sempre que o usuário:
- marca uma regra;
- desmarca uma regra;
- altera o peso de corte;
- altera o limite de leite puro;

o sistema recalcula os **embarques automáticos abertos**.

### O que acontece no recálculo

1. O sistema verifica todos os pedidos dentro dos embarques automáticos `ABERTOS`.
2. Pedido que ainda atende a pelo menos uma regra marcada permanece.
3. Pedido que não atende mais a nenhuma regra é **desembarcado automaticamente**.
4. O peso e os percentuais do embarque são recalculados.
5. Se o embarque ficar vazio, o caminhão é liberado e volta para `A DEFINIR`.
6. Em seguida o sistema analisa novamente os pedidos disponíveis e aloca somente os pedidos permitidos pelas regras atuais.

### Segurança

O recálculo automático **não desmonta**:
- embarques `FECHADOS`;
- pedidos antecipados manualmente pelo mapa;
- pedidos marcados como alocação manual.

Esses pedidos são preservados mesmo que o filtro atual não corresponda.

### Compatibilidade

Para embarques abertos criados em versões anteriores, pedidos que não estejam marcados como antecipação manual são considerados automáticos para efeito do recálculo.

## V5.29 — mapeamento automático de colunas

O arquivo importado não precisa mais seguir um cabeçalho rígido.

O sistema:
- procura o cabeçalho real nas primeiras 40 linhas;
- reconhece sinônimos de cada coluna;
- em XLSX/XLSM com várias abas escolhe automaticamente a aba mais compatível;
- mostra a coluna escolhida e o nível de confiança;
- permite remapear com um botão;
- avisa se faltarem campos essenciais.

Exemplos reconhecidos:

**Pedido:** Ped. Sistema, Pedido, Num Pedido, Nro Pedido, Número Pedido, Ordem Venda.

**Cidade:** Cidade, Município, Cidade Cliente, Destino, Cidade Entrega.

**Peso:** Peso, Peso Bruto, Peso Total, Peso Líquido, Peso KG, Peso Pedido.

**Embarque:** Embarque, Num Embarque, Nro Embarque, Número Embarque, Carga, Num Carga.

Também são identificados cliente, nome, item, descrição, crédito, situação, quantidades, valores, representante e datas.

## V5.29 — identificação de planilha otimizada

A leitura foi alterada para reduzir o tempo de identificação de arquivos grandes.

### Otimizações

1. O XLSX/XLSM não descompacta mais arquivos internos desnecessários, como temas, estilos, imagens e metadados.
2. Para descobrir a aba correta, o sistema lê somente uma amostra das primeiras 45 linhas de cada aba.
3. A identificação do cabeçalho continua procurando nas primeiras 40 linhas.
4. Se uma aba já possui todos os campos essenciais e boa compatibilidade, a busca para imediatamente.
5. Somente depois de escolher a aba o sistema processa seus dados completos.
6. A leitura de células usa um parser leve, evitando construir uma árvore DOM completa para planilhas grandes.
7. Abas já processadas ficam em cache durante a sessão.
8. O botão `Remapear colunas` não relê o arquivo inteiro; ele reaproveita os dados já carregados.
9. A tela informa quantos segundos a leitura/mapeamento levou.

Essas mudanças são especialmente importantes para relatórios ESPD com milhares ou dezenas de milhares de linhas.

## V5.29 — correção do travamento em “Identificando estrutura”

A leitura de Excel foi refeita para evitar bloqueio na etapa inicial.

- o ZIP interno do XLSX/XLSM é apenas indexado primeiro;
- workbook, relacionamentos e shared strings são lidos antes das planilhas;
- as abas não são mais descompactadas todas de uma vez;
- se houver somente uma aba, ela é aberta diretamente sem análise comparativa;
- se houver várias abas, apenas uma amostra de até 45 linhas de cada uma é carregada;
- a aba completa só é descompactada depois de escolhida;
- cada etapa atualiza o status visual;
- leitura do arquivo e descompactação possuem timeout;
- qualquer falha gera mensagem explícita, evitando ficar preso em “Identificando estrutura”.

## V5.29 — correção do erro `unzip is not defined`

Foi removida a função `parseWorkbook()` antiga que permaneceu duplicada na V5.29.

Ela sobrescrevia o leitor novo e tentava executar `unzip()`, função que já havia sido substituída pelo leitor seguro.

A V5.29 mantém somente o leitor novo baseado em:
- `buildZipIndex`;
- `extractZipEntry`;
- `DecompressionStream`;
- pré-leitura das abas;
- carregamento completo apenas da aba escolhida.

O fluxo de progresso e as mensagens de erro continuam ativos.

## V5.29 — leitor Excel robusto com fallback direto

A correção foi feita usando o arquivo real `espd094 (1).xlsx`.

Esse arquivo contém normalmente:
- 1 aba chamada `Planilha`;
- `xl/workbook.xml`;
- `xl/_rels/workbook.xml.rels`;
- `xl/worksheets/sheet1.xml`.

A versão anterior podia falhar ao interpretar `workbook.xml`/relacionamentos XML e concluir incorretamente que não existiam abas.

### Nova estratégia

1. O app cria primeiro um índice das entradas ZIP do XLSX.
2. Localiza diretamente todos os arquivos `xl/worksheets/*.xml`.
3. Lê nomes e relações do `workbook.xml` sem depender de namespace DOM.
4. Se a interpretação do workbook falhar, usa diretamente as worksheets encontradas.
5. Se o caminho de uma aba estiver inconsistente, usa a worksheet real disponível como fallback.
6. Só retorna “nenhuma aba” quando realmente não existe nenhum XML de worksheet no arquivo.

Também foram incluídas variações encontradas no arquivo real, como:
- `Num Pedido`;
- `Desc Item`;
- `Representate`;
- `Qtd Ped`;
- `Qtd Atende`;
- `Valor`;
- `Dt Cancela`.

O arquivo original ainda não possui Cidade, Peso e Embarque; esses campos são reportados como ausentes, mas a planilha deve ser aberta e suas colunas existentes identificadas normalmente.

## V5.29 — correção de `parseSharedBytes is not defined`

A função que lê `xl/sharedStrings.xml` foi adicionada ao arquivo final.

Essa parte é essencial porque XLSX normalmente armazena textos como:
- nomes das colunas;
- nomes de clientes;
- descrições dos produtos;

em `sharedStrings.xml`, enquanto as células guardam apenas o índice desse texto.

### Teste realizado

A versão foi validada com o arquivo real `espd094 (1).xlsx`, executando:

1. abertura do XLSX;
2. leitura do índice ZIP;
3. localização da aba `Planilha`;
4. leitura de `sharedStrings.xml`;
5. reconstrução das células da `sheet1.xml`;
6. identificação do cabeçalho.

O teste confirmou os cabeçalhos reais:
`Num Pedido`, `Dt Emissao`, `Cliente`, `Nome Cliente`, `Item`, `Desc Item`, `Representate`, `Usr Impl`, `Qtd Ped`, `Qtd Atende`, `Valor`, `Dt Cancela` e outros.

## V5.29 — suporte a XML com namespace/prefixo

A planilha `ESPD094_TESTE_COMPLETO_TODAS_FUNCOES.xlsx` foi usada como teste de compatibilidade.

Ela utiliza tags XML no formato:

- `<x:sheet>`
- `<x:row>`
- `<x:c>`
- `<x:v>`
- `<x:si>`
- `<x:t>`

Enquanto outros arquivos XLSX utilizam:

- `<sheet>`
- `<row>`
- `<c>`
- `<v>`
- `<si>`
- `<t>`

A V5.29 reconhece os dois formatos.

Também foi ampliado o fallback de abas:
- nomes do `workbook.xml`;
- relacionamentos do `workbook.xml.rels`;
- localização direta de todos os `xl/worksheets/*.xml`.

### Testes realizados

A V5.29 foi testada contra:

1. `espd094 (1).xlsx`
2. `ESPD094_TESTE_COMPLETO_TODAS_FUNCOES.xlsx`

Na base de teste completa, o leitor deve encontrar:
- `ESPD_TESTE`
- `LEGENDA_TESTE`
- `GUIA_TESTES_COMPLETO`

e escolher automaticamente `ESPD_TESTE` por possuir os cabeçalhos operacionais do software.

## V5.29 — cálculo do peso por pedido e alocação por capacidade

O peso agora é calculado no nível do pedido.

### Regra principal

Quando a coluna mapeada é um peso de linha/item:

`PESO DO PEDIDO = soma do peso de todas as linhas/itens do mesmo Ped. Sistema`

Exemplo:

- Item A: 1.680,993 kg
- Item B: 1.219,007 kg
- Pedido: **2.900 kg**

### Peso unitário

Se não houver peso total da linha, mas existir uma coluna reconhecida como `Peso Unitário`, o app pode calcular:

`PESO DA LINHA = PESO UNITÁRIO × QTD. PEDIDA`

e depois somar as linhas do pedido.

### Peso incompleto

A mera existência de uma coluna Peso não é mais suficiente.

Se um pedido possui várias linhas e alguma linha necessária está sem peso:
- o peso fica marcado como `INCOMPLETO`;
- o valor parcial conhecido é preservado para diagnóstico;
- o sistema não trata o pedido como 0 kg.

### Alocação

Para pedidos com peso calculado:
- o sistema verifica a capacidade física do caminhão;
- nunca ultrapassa a capacidade;
- usa o peso total da rota para escolher o primeiro veículo;
- processa pedidos mais pesados primeiro;
- usa best-fit para aproveitar o espaço disponível;
- abre outro embarque da mesma rota quando necessário;
- se nenhum caminhão comportar o pedido, ele vai para pendência.

### Exemplo de escolha de veículo

Se uma rota tiver:
- pedido 1 = 4.000 kg
- pedido 2 = 3.000 kg

a demanda conhecida é 7.000 kg.

O sistema tenta escolher um veículo capaz de receber o conjunto, em vez de escolher um caminhão de 4.400 kg olhando apenas o primeiro pedido.

### Testes da base completa

Na planilha de teste:
- pedido `9910001` deve calcular **2.600 kg**;
- pedido `9910006` possui duas linhas e deve calcular **2.900 kg** pela soma;
- pedidos sem peso continuam com `peso pendente`, sem inventar kg.

## V5.29 — leite puro somente manual

Foram removidos da interface:
- filtros de derivados;
- Limite de leite puro por embarque;
- Peso de corte das regras;
- Comportamento do filtro;
- Regras que podem entrar nos embarques;
- caixas de seleção;
- filtro de derivados no detalhe do embarque.

### Regra automática

Continuam automáticos:
- derivados;
- leite + derivados;
- mistos;
- outros produtos.

Não entra automaticamente:
- pedido classificado como SOMENTE LEITE.

### Liberação manual

Todos os pedidos somente leite ficam visíveis em:
`Somente leite — liberação manual`.

Pedidos acima de **1.200 kg** recebem destaque e o botão `Embarcar manualmente`.

O botão permite escolher um embarque aberto da rota, valida a capacidade do caminhão e pede confirmação. Depois de inserido manualmente, o pedido recebe `allocationSource = MANUAL_MILK` e não é removido pelo recálculo automático.

## V5.29 — roteirização porta a porta por embarque

A base de teste pode trazer:
- Ponto Entrega Teste
- Endereco Entrega
- Bairro Entrega
- CEP Entrega
- Endereco Completo
- Fonte Mapa
- ID Parada Teste

O mapeador automático reconhece esses campos.

### Roteirizar entregas

Ao abrir um embarque, existe o botão `Roteirizar entregas`.

O sistema:

1. reúne todos os pedidos do embarque;
2. recupera o endereço completo de cada pedido;
3. consolida pedidos que possuem o mesmo endereço em uma única parada;
4. usa a origem fixa da Cooperrita (`-22.261541, -45.764269`);
5. geocodifica cada endereço;
6. consulta uma matriz rodoviária entre a origem e todas as paradas;
7. cria uma sequência inicial pelo vizinho mais próximo;
8. melhora a sequência com 2-opt;
9. calcula a rota final pela malha rodoviária;
10. mostra km totais, tempo estimado e a ordem 1ª/2ª/3ª... das entregas;
11. desenha o percurso no mapa;
12. permite abrir a sequência no Google Maps.

A rota é aberta: começa na Cooperrita e termina na última entrega. Não força retorno para a origem.

### Dados de teste

O projeto inclui `MODELO_ESPD_ENDERECOS_TESTE.csv`.

Os endereços são estabelecimentos públicos/comerciais reais usados somente para testar a roteirização. Não constituem cadastro operacional de clientes.

### Serviços de teste

A geocodificação usa OpenStreetMap/Nominatim e a matriz/rota rodoviária usa o servidor público OSRM, portanto a roteirização precisa de internet.

Para operação produtiva em escala, recomenda-se trocar os serviços públicos por um provedor próprio/comercial.

## V5.29 — rotas de entrega por motorista na Análise inteligente

A aba `Análise de rotas` agora possui:

- filtro por dia;
- filtro por motorista;
- botão `Gerar rotas dos motoristas`;
- rotas porta a porta desenhadas no mapa;
- resumo de km, tempo, paradas, placa e embarques de cada motorista.

### Como a rota de um motorista é formada

Para cada dia:

1. o sistema encontra todos os embarques atribuídos ao motorista;
2. reúne todos os pedidos desses embarques;
3. recupera os endereços das entregas;
4. consolida pedidos no mesmo endereço;
5. parte da Cooperrita;
6. calcula a matriz rodoviária entre todas as paradas;
7. aplica vizinho mais próximo;
8. melhora a sequência usando 2-opt;
9. calcula a rota rodoviária final;
10. salva a rota no planejamento daquele dia.

Se um motorista possuir dois embarques no mesmo dia, os pedidos dos dois entram no cálculo de uma única rota de entrega do motorista.

### Filtro do mapa

`Todos os motoristas`:
- mostra todas as rotas geradas;
- cada motorista tem uma cor própria;
- os corredores planejados dos dias ficam discretos ao fundo.

Ao escolher um motorista:
- as demais rotas são ocultadas;
- o mapa mostra somente a rota desse motorista;
- as paradas ficam numeradas na sequência de entrega.

### Semana inteira

Com o filtro de dia em `Semana inteira`, o sistema pode gerar e visualizar as rotas de segunda a sexta.

Ao filtrar um motorista específico nesse modo, são mostradas as rotas desse motorista nos diferentes dias da semana.

### Resumo

Abaixo do mapa aparece um cartão por rota gerada, contendo:
- motorista;
- dia;
- placa;
- números dos embarques;
- quantidade de paradas;
- distância total;
- tempo estimado;
- primeiras paradas;
- botão para abrir a sequência no Google Maps.

## V5.29 — perto para longe + App do Motorista

### Ordem obrigatória

A roteirização passou a ordenar todas as paradas pela distância **rodoviária direta a partir da Cooperrita**:

`Cooperrita → parada mais próxima → próxima mais distante → ... → parada mais distante`

Não é aplicado 2-opt depois dessa ordenação, porque o 2-opt poderia colocar uma parada mais distante antes de uma parada mais próxima.

A rota rodoviária final é calculada respeitando exatamente essa sequência.

### Todos os pedidos

Para cada motorista/dia:
- todos os pedidos de todos os embarques atribuídos a ele entram no conjunto;
- pedidos duplicados são eliminados pelo número do pedido;
- pedidos com o mesmo endereço são consolidados em uma única parada;
- todos os números de pedidos permanecem dentro dessa parada;
- a rota só é aceita como completa quando `pedidos roteirizados = pedidos atribuídos`.

Se algum pedido não tiver endereço, a rota fica com pendência em vez de ignorar o pedido.

### App do Motorista

Cada cartão de rota possui:
- `Abrir App do Motorista`;
- `Copiar link`;
- `Google Maps`.

O arquivo `motorista.html` é mobile-first e recebe os dados da rota no próprio link.

No celular ele mostra:
- motorista;
- placa;
- embarques;
- quantidade de pedidos;
- quantidade de paradas;
- distância;
- mapa;
- paradas numeradas do mais perto para o mais longe;
- distância de cada parada até a Cooperrita;
- pedidos de cada endereço;
- botão `Navegar até esta entrega`;
- botão `Marcar como entregue`;
- progresso das entregas.

### Link compartilhável

Quando o projeto estiver publicado em GitHub Pages ou outro servidor HTTP/HTTPS, o link gerado para `motorista.html` pode ser enviado diretamente ao motorista.

Se o projeto estiver sendo aberto localmente com `file://`, o link funciona no mesmo computador, mas para abrir em outro celular é necessário publicar a pasta do projeto.

## V5.29 — WhatsApp por motorista

### Cadastro

Na aba `Frota`, cada motorista possui o campo:

`WhatsApp do motorista`

Pode ser informado como:
- `(35) 99999-9999`
- `35999999999`
- `5535999999999`

Se o número tiver apenas DDD + telefone, o sistema acrescenta o código do Brasil `55`.

Os números ficam armazenados no navegador junto com a frota.

### Envio depois da roteirização

Na `Análise inteligente de rotas` existe a opção:

`Abrir WhatsApp ao concluir a rota de um motorista`

Quando um motorista específico está selecionado e a rota é gerada:
1. o sistema calcula todas as entregas;
2. valida todos os pedidos;
3. gera o link do App do Motorista;
4. monta a mensagem;
5. abre automaticamente a conversa daquele WhatsApp com a mensagem preenchida.

A mensagem contém:
- motorista;
- veículo;
- dia;
- embarques;
- quantidade de pedidos;
- quantidade de paradas;
- distância;
- link para o App do Motorista.

Por limitação de segurança do WhatsApp, o navegador não pode clicar em `Enviar` sozinho. O motorista/operador confirma o envio no WhatsApp.

### Todos os motoristas

Quando `Todos os motoristas` está selecionado, o sistema não tenta abrir diversas janelas ao mesmo tempo, porque navegadores bloqueiam popups múltiplos.

Depois da geração aparece a seção:

`WhatsApp — envio das rotas`

Ela mostra cada motorista e:
- WhatsApp cadastrado;
- dias roteirizados;
- número de pedidos;
- botão `Enviar rota`.

Motoristas sem WhatsApp possuem botão para abrir a aba Frota e cadastrar o número.

### URL pública

Foi incluído o campo:

`URL pública do sistema / GitHub Pages`

Exemplo:
`https://usuario.github.io/gestao-logistica/`

Quando preenchido, o link enviado por WhatsApp aponta para:
`https://usuario.github.io/gestao-logistica/motorista.html#...`

Se o sistema já estiver aberto por HTTP/HTTPS, a URL atual é utilizada automaticamente quando não houver uma URL pública cadastrada.

Se estiver aberto localmente por `file://`, configure uma URL pública para o link funcionar no celular do motorista.

### Envio 100% automático

Esta versão utiliza o fluxo padrão do WhatsApp (`wa.me`): abre a conversa certa com a mensagem pronta.

O envio sem nenhuma confirmação humana exige WhatsApp Business Platform / Cloud API, credenciais Meta e um backend autorizado. Isso não pode ser feito com segurança somente em um arquivo HTML estático.

## V5.29 — Apps dos Motoristas vinculados ao Gestão Logística

Foi criada a aba `Apps dos Motoristas`.

Cada motorista da frota possui um cartão próprio, por exemplo:
- App do JOSIMAR
- App do EDENILSON
- App do LEONARDO
- App do OZIRES
- App do WELDER
- etc.

Não são sistemas independentes: todos utilizam o mesmo `motorista.html`, mas cada link recebe exclusivamente a rota e os dados do motorista correspondente.

### Vínculo automático

Quando uma rota motorista/dia é gerada:
1. ela é salva em `plans[day].driverRoutes`;
2. o cartão daquele motorista em `Apps dos Motoristas` passa a mostrar `APP ATUALIZADO`;
3. o app recebe motorista, placa, embarques, pedidos, endereços, paradas e ordem perto→longe;
4. a última rota continua disponível no cartão para abrir ou reenviar.

### WhatsApp solicitado após roteirizar

Ao gerar a rota com um motorista específico selecionado:
1. a rota é calculada;
2. todos os pedidos são validados;
3. o sistema pergunta/confirma o WhatsApp do motorista;
4. o número fica salvo no cadastro;
5. o link do App do Motorista é gerado;
6. o WhatsApp é aberto com a mensagem pronta.

Se cancelar a pergunta do WhatsApp, a rota continua salva no App do Motorista e pode ser enviada depois.

### Todos os motoristas

Ao gerar `Todos os motoristas`, todas as rotas/apps são atualizadas.

Como navegadores bloqueiam várias janelas automáticas, o sistema não abre dezenas de WhatsApps sozinho. A central de envio e a aba `Apps dos Motoristas` mostram um botão para cada motorista.

Ao clicar em enviar:
- o sistema pergunta/confirma o WhatsApp;
- salva o número;
- abre a conversa com o App correto.

### Aba Apps dos Motoristas

Cada cartão mostra:
- nome do app;
- motorista;
- placa e capacidade;
- WhatsApp;
- última rota vinculada;
- dia;
- embarques;
- quantidade de paradas;
- quantidade de pedidos;
- data/hora da geração;
- botão `Abrir app`;
- botão `Enviar celular`;
- botão `Ver/Gerar rota`.

O App continua sendo parte do mesmo projeto GitHub/VS Code.

## V5.29 — WhatsApp funciona também com o sistema aberto localmente

Foi removido o alerta:

`O sistema está aberto localmente e ainda não possui uma URL pública configurada...`

### Modo local

Quando o Gestão Logística é aberto por `file://`:

- o WhatsApp é aberto normalmente;
- não existe mais bloqueio ou pergunta sobre URL pública;
- a mensagem não envia um link `file://` quebrado;
- a rota completa é enviada em texto;
- cada parada mostra:
  - número da sequência;
  - local/endereço;
  - distância da Cooperrita;
  - pedidos daquela parada;
  - link `Navegar` do Google Maps.

Assim o motorista consegue executar a rota pelo celular mesmo sem o sistema estar publicado.

### Modo público

Quando existe uma `URL pública do sistema / GitHub Pages` ou o Gestão Logística já está aberto por HTTP/HTTPS:

- a mensagem continua mostrando os dados da rota;
- inclui também o link do `motorista.html`;
- o motorista pode abrir o App completo no celular.

### Regra

A URL pública passou a ser opcional para o envio pelo WhatsApp.

Ela só é necessária se você quiser que o motorista abra o App HTML completo no próprio celular.

## V5.29 — um único App com todas as entregas do motorista

O link do App do Motorista não representa mais apenas uma rota isolada.

### Novo comportamento

Ao gerar/enviar o App de um motorista, o sistema reúne as rotas válidas dele na semana operacional atual.

O mesmo link pode conter:
- vários embarques;
- vários dias;
- todas as paradas;
- todos os pedidos.

Exemplo:
- JOSIMAR — segunda: 2 embarques, 7 paradas;
- JOSIMAR — terça: 1 embarque, 4 paradas.

O App do JOSIMAR passa a abrir com:
- Segunda-feira — 7 paradas;
- Terça-feira — 4 paradas;
- total geral de pedidos/paradas;
- mapa com todas as rotas;
- progresso de todas as entregas.

### Regra de ordem

Cada dia permanece independente e segue:
`Cooperrita → entrega mais próxima → ... → entrega mais distante`.

As entregas não são misturadas entre dias diferentes.

### WhatsApp

Quando existe URL pública, a mensagem passa a enviar **um único link**:

`App do Motorista — TODAS AS ENTREGAS`

Esse único link contém todas as rotas do motorista disponíveis no período.

No modo local, o WhatsApp continua recebendo todas as entregas em texto e links de navegação, pois um endereço `file://` não é acessível pelo celular.

### Compatibilidade

O novo `motorista.html` aceita:
- links V5.29 com múltiplas rotas (`v:2`);
- links antigos com uma rota (`v:1`), convertidos automaticamente.

## V5.29 — GPS do motorista + monitoramento em tempo real

### Correção do link com todas as entregas

Quando Firebase está configurado, o sistema não coloca mais toda a rota dentro do URL.

A central salva o App completo em:

`driverApps/<ID_DO_APP>`

O WhatsApp recebe um link curto como:

`motorista.html#app=driver_xxxxx&cfg=...`

Ao abrir, o celular busca todas as entregas diretamente da base. Isso evita perda de pedidos por URLs muito grandes.

### Rota a partir da localização atual

No App do Motorista existe o botão:

`Ativar GPS e roteirizar`

Depois da autorização:
1. o navegador lê a posição atual;
2. identifica a rota ativa;
3. considera todas as entregas ainda não concluídas;
4. consulta distância rodoviária da posição atual até cada parada;
5. reorganiza as entregas restantes da mais perto para a mais longe;
6. calcula o novo percurso;
7. mantém todos os demais dias/entregas visíveis no App.

Ao marcar uma entrega como concluída, o App pode recalcular novamente a rota restante.

### Rastreamento na central

Com Firebase configurado, o App publica periodicamente:

- latitude;
- longitude;
- precisão GPS;
- velocidade (quando o aparelho fornece);
- direção/heading (quando disponível);
- horário;
- total de paradas;
- concluídas;
- restantes;
- motorista;
- placa.

A central mostra esses dados em `Caminhões ao vivo` e desenha um marcador 🚚 sobre o mapa.

Posições com mais de 60 segundos são indicadas como desatualizadas.

### Requisitos reais para GPS

Geolocalização em navegador móvel exige contexto seguro:

- HTTPS;
- localhost para desenvolvimento.

Um arquivo aberto com `file://` não é suficiente para rastrear um celular.

GitHub Pages atende ao requisito HTTPS.

### Firebase

Consulte `FIREBASE_SETUP.md`.

A versão usa:
- Firebase Authentication com login anônimo;
- Firebase Realtime Database;
- Firebase Web SDK carregado em runtime.

A configuração Web do projeto Firebase é colada diretamente dentro da Análise inteligente de rotas.

## V5.29 — Firebase já integrado ao software

O projeto Firebase fornecido para o Gestão Logística já foi incorporado nesta versão.

Configuração utilizada:

```json
{
  "apiKey": "AIzaSyBmEX1QM6pJmMO116YTADhqMKOhWl5Nz8Q",
  "authDomain": "gestao-logistica-4c606.firebaseapp.com",
  "databaseURL": "https://gestao-logistica-4c606-default-rtdb.firebaseio.com/",
  "projectId": "gestao-logistica-4c606",
  "appId": "1:484709506190:web:52590b0888a1da0f1efddf"
}
```

### O que mudou

Ao abrir o Gestão Logística:

1. a configuração Firebase já está preenchida;
2. o sistema tenta autenticação anônima automaticamente;
3. conecta ao Realtime Database;
4. verifica rotas de motoristas já existentes;
5. publica/sincroniza os Apps dos motoristas;
6. inicia a escuta de `tracking/<appId>`;
7. atualiza `Caminhões ao vivo` assim que um celular começar a transmitir GPS.

Não é necessário colar novamente o JSON do Firebase a cada abertura.

### Se aparecer erro de autenticação

No Firebase Console:

`Authentication → Sign-in method → Anonymous → Enable`

### Se aparecer Permission denied

Verifique as regras do Realtime Database usando `firebase-rules.json`.

### O que ainda precisa ser publicado em HTTPS

O Firebase está integrado, mas o GPS do navegador no celular requer uma página HTTPS.

Portanto `index.html` e `motorista.html` precisam ser publicados, por exemplo no GitHub Pages.

Depois informe a URL pública no campo:

`URL pública do sistema / GitHub Pages`

Exemplo:

`https://usuario.github.io/gestao-logistica/`

Esse endereço permite que o WhatsApp envie um link acessível ao celular e que o navegador autorize geolocalização.

## Correção V5.29 — link do App do Motorista

Esta versão corrige o caso em que o link enviado pelo WhatsApp abria o App mas não carregava as viagens do motorista.

Mudanças principais:

- o link só é liberado depois que o pacote completo do motorista é gravado no Realtime Database;
- a central lê o pacote de volta e confere motorista, quantidade de pedidos, paradas, versão e assinatura;
- publicações antigas ou inexistentes são republicadas automaticamente;
- o link leva uma revisão curta (`rev`) e os totais esperados de pedidos/paradas;
- o App do Motorista tenta sincronizar várias vezes antes de declarar erro;
- se a central atualizar as viagens enquanto o App estiver aberto, o celular recebe a atualização automaticamente;
- o ID do App é estável por motorista, portanto o mesmo link pode continuar apontando para as viagens mais recentes;
- quando o Firebase falha, o sistema bloqueia o envio do link em vez de mandar um link vazio;
- `motorista.html?v=529` ajuda a evitar que o celular use uma versão antiga em cache.

### Importante ao publicar no GitHub Pages

Substitua **os dois arquivos** no repositório:

- `index.html`
- `motorista.html`

Se somente `index.html` for atualizado, o link poderá abrir uma versão antiga do App do Motorista.
