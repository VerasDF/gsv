const cmdExibirEscala = document.getElementById('cmdExibirEscala')
const cmdCotaDobrada = document.getElementById('cmdCotaDobrada')
const cmdExportarPdf = document.getElementById('cmdExportarPdf')
const cmdPesquisarPorSiape = document.getElementById('cmdPesquisarPorSiape')
const cmdTotais = document.getElementById('cmdTotais')
const divOperacoes = document.getElementById('divOperacoes')
const divParametros = document.getElementById('divParametros')
const divResultado = document.getElementById('divResultado')
const dtDia = document.getElementById('dtDia')
const fieldset1 = document.getElementById('fieldset1')
const fieldset2 = document.getElementById('fieldset2')
const fieldset3 = document.getElementById('fieldset3')
const fieldset4 = document.getElementById('fieldset4')
const labStatus = document.getElementById('labStatus')
const radQuinzena1 = document.getElementById('radQuinzena1')
const radQuinzena2 = document.getElementById('radQuinzena2')
const radQuinzena3 = document.getElementById('radQuinzena3')
const radVoluntarioCom = document.getElementById('radVoluntarioCom')
const radVoluntarioSem = document.getElementById('radVoluntarioSem')
const radVoluntarioTodos = document.getElementById('radVoluntarioTodos')
const txtNomeDoArquivo = document.getElementById('txtNomeDoArquivo')
const txtSiape = document.getElementById('txtSiape')

const cabecalho = `<td class="label_data_th">POSTO/GRAD</td><td class="label_data_th">NOME</td><td class="label_data_th">SIAPE</td><td class="label_data_th">LOTAÇÃO</td><td class="label_data_th">QUADRO</td><td class="label_data_th">ALA</td><td class="label_data_th">ASSINATURA</td>`
                   
let dadoJson = []
let config = {}
                   
function avaliacao(info) {
    if(info === null){
        $info({msg:`Não há dados a serem processados, ocorreu algum problema.`, opt:0})
        return
    }

    controlesAtivos(false)
    preencherSelect(divOperacoes, totais('OPERAÇÃO', filtrarDados({quinzena:'1ª Quinzena'})))

    const parser = new DOMParser()
    let dadoBruto = []
    
    dadoBruto = parser.parseFromString(info, 'text/html')
    dadoBruto = dadoBruto.querySelector(".table_relatorio")
    dadoBruto = dadoBruto.children[0]
    
    prepararJSon(dadoBruto)
    $info({msg:`Gerenciadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoJson.length)} cotas`, opt:0})
    dtDia.value = `${dadoJson[0].DATA.split('/')[2]}-${dadoJson[0].DATA.split('/')[1]}-${dadoJson[0].DATA.split('/')[0]}`
}

function prepararJSon(info) {
    let opr = {}
    dadoJson=[]
    for (i = 0; i < info.childElementCount; i++) {
        const obj = {}
        const tr = info.children[i]
        const filhos = tr.childElementCount
        if (filhos === 1) {
            const td = tr.children[0]
            for (j = 0; j < td.childElementCount; j++) {
                const span = td.children[j]
                opr[span.className] = span.innerHTML
            }
        }
        if (filhos === 7) {
            if (tr.children[0].nodeName === "TD") {
                obj['POSTO_GRAD'] = `${_sanitizar(tr.children[0].innerHTML)}`,
                obj['NOME'] = `${_sanitizar(tr.children[1].innerHTML)}`,
                obj['ESCALADO'] = `${_sanitizar(tr.children[1].title)}`,
                obj['SIAPE'] = `${_sanitizar(tr.children[2].innerHTML)}`,
                obj['LOTAÇÃO'] = `${_sanitizar(tr.children[3].innerHTML)}`,
                obj['QUADRO'] = `${_sanitizar(tr.children[4].innerHTML)}`,
                obj['CIRCULO'] = `${_extrairCirculo(tr.children[4].innerHTML)}`,
                obj['ALA'] = `${_sanitizar(tr.children[5].innerHTML)}`,
                obj['ASSINATURA'] = ``,
                obj['GRUPO'] = _classificarGrupo(opr.name_dois),
                obj['GBM_DESTINO'] = _extrairGbm({quatro:opr.name_quatro, um:opr.desc_um}),
                obj['HORA'] = _extrairHorario(opr.name_quatro),
                obj['LOCAL'] = 'falta implementar',
                obj['MÊS'] = _extrairMesExtenso(opr.name_tres),
                obj['QUINZENA'] = _extrairQuinzena(opr.name_tres),
                obj['DATA'] = opr.name_tres, //DATA
                obj['TEMPO'] = _extrairTempo({data:obj['DATA'], hora:obj['HORA']}),
                obj['VALOR'] = _extrairValor(obj['TEMPO']),
                obj['name_tres'] = opr.name_tres, //DATA
                obj['name_quatro'] = opr.name_quatro, //HORA - OPERAÇÃO - GBM
                obj['desc_um'] = opr.desc_um, //SUB_LOTAÇÃO_LOCAL
                obj['name_um'] = opr.name_um, //OPERAÇÃO - GBM
                obj['OPERAÇÃO'] = opr.name_dois, //OPERAÇÃO - TIPO
                obj['name_dois'] = opr.name_dois, //OPERAÇÃO - TIPO
                obj['name_cinco'] = opr.name_cinco // CATEGORIA
                dadoJson.push(obj)
            }
        }
        if (filhos !== 1 && filhos !== 7) {
            alert('Alteração no padrão de gerenciamento.')
            break
        }
    }
        
    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "")
        retorno = retorno.replace("&nbsp;", "").trim()
        return retorno
    }
    
    function _classificarGrupo(parametro){
        let retorno = ''
        
        if (parametro.indexOf("REFORÇO") >-1) {
            retorno = "REFORÇO OPERACIONAL"
        } else if (parametro.indexOf("SEGURANÇA") >-1) {
            retorno = "SEGURANÇA NAS INSTRUÇÕES"
        } else if (parametro.indexOf("CHUVOSO") >-1) {
            retorno = "PERÍODO CHUVOSO"
        } else if (parametro.indexOf("VERDE") >-1) {
            retorno = "VERDE VIVO"
        } else if (parametro.indexOf("SABURO") >-1) {
            retorno = "SABURO ONOYAMA"
        } else if (parametro.indexOf("PARQUE NACIONAL") >-1) {
            retorno = "PARQUE NACIONAL"
        } else {
            retorno = "EXTRAORDINÁRIO"
        }
        return retorno
    }

    function _extrairGbm(parametro){
        let retorno = parametro.quatro.split('-')
        retorno = retorno[1].trim()
//---Acertar GBMs de destino------------------
        if ( retorno === "HRC" || retorno === "HRT" || retorno === "IHBDF" ){
            retorno = "GAEPH"
        }
        if ( retorno.indexOf("Parque da Cidade") > -1 ){
         retorno = "GAEPH"
        }
        if ( retorno.indexOf("Parque de Águas Claras") > -1 ){
            retorno = "GAEPH"
        }
        if ( retorno.indexOf("GAVOP") > -1 ){
            retorno = "GAVOP"
        }
        if ( retorno === "Parque Ecológico Saburo Onoyama" ){
            retorno = "2º GBM"
        }
//---Acertar Operação Verde Vivo 2023---------
        if ( retorno.indexOf("VERDE VIVO") >-1 ){
            retorno = parametro.um
        }

        return retorno
    }

    function _extrairHorario(parametro){
        let retorno = parametro.split('-')
        retorno = retorno[0].trim()
        return retorno
    }

    function _extrairCirculo(parametro){
        let retorno = ''
        if(parametro.indexOf("QBMG") > -1){
            retorno = "Praça"
        }
        else if(parametro.indexOf("QOBM" > -1)){
            retorno = "Oficial"
        }
        return retorno
    }

    function _extrairQuinzena(parametro){
        const dataDMY = parametro.split('/')
        const dia = dataDMY[0]
        const quinzena = (dia > 15 ? `2ª Quinzena` : `1ª Quinzena`)        
        return quinzena
    }

    function _extrairMesExtenso(parametro){
        const dataDMY = parametro.split('/')
        const mes = dataDMY[1]
        if(mes === '01'){return `Janeiro`}
        if(mes === '02'){return `Fevereiro`}
        if(mes === '03'){return `Março`}
        if(mes === '04'){return `Abril`}
        if(mes === '05'){return `Maio`}
        if(mes === '06'){return `Junho`}
        if(mes === '07'){return `Julho`}
        if(mes === '08'){return `Agosto`}
        if(mes === '09'){return `Setembro`}
        if(mes === '10'){return `Outubro`}
        if(mes === '11'){return `Novembro`}
        if(mes === '12'){return `Dezembro`}
    }

    function _extrairTempo(parametro){
        const auxData = `${parametro.data.substr(6, 4)}-${parametro.data.substr(3, 2)}-${parametro.data.substr(0, 2)}`
        const auxHora = parametro.hora.toLowerCase()
        let retorno = ""
        if(auxHora.indexOf('às') > -1){
            const vtr1 = auxHora.split(' às ')
            let ini = new Date(`${auxData}T${vtr1[0].replace('h',':')}:00`)
            let fim = new Date(`${auxData}T${vtr1[1].replace('h',':')}:00`)
            if( fim <= ini ){
                fim = new Date(fim.setDate(fim.getDate()+1))
            }
            const auxTempo = (((fim - ini)/1000)/60)/60
            retorno = auxTempo
        }
        return retorno
    }
    
    function _extrairValor(parametro){
        return parametro * 50
    }
}

const $ajax = (arquivo, funcaoDeRetorno) => {
    const url = arquivo
    const XmlReq = new XMLHttpRequest()
    //request.responseText = 'json'
    XmlReq.open('GET', url, true)
    XmlReq.onreadystatechange = () => {
        //console.log('[XmlReq.readyState]', XmlReq.readyState)
        if (XmlReq.readyState === 4) {
            //console.log('[XmlReq.status]', XmlReq.status)
            if (XmlReq.status === 200) {
                funcaoDeRetorno(XmlReq.response)
            }
            if (XmlReq.status === 404) {
                funcaoDeRetorno(null)
            }
        }
    }
    XmlReq.send()
}

function $readFile(input, funcaoDeRetorno) {
    let file = input.files[0]
    let reader = new FileReader()

    reader.readAsText(file)

    reader.onload = function () {
        funcaoDeRetorno(reader.result)
    }

    reader.onerror = function () {
        console.log(reader.error)
        funcaoDeRetorno(null)
    }

}

txtNomeDoArquivo.addEventListener('change',(e)=>{
    e.preventDefault()
    controlesAtivos(true)
    divResultado.innerHTML = ''
    dadoJson=[]
    let arquivo = txtNomeDoArquivo.files
    if(arquivo.length > 0){
        $info({msg:`Tentando ler arquivo, parece conter muitos dados...`, opt:0})
        config.arquivo = (arquivo[0].name).split(".")[0]
        arquivo = `./${arquivo[0].name}`
        $readFile(txtNomeDoArquivo, avaliacao)
    } else {
        $info({msg:``, opt:0})
    }
})

window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
        divParametros.classList.toggle('ocultarDiv')
    }
})

radQuinzena1.addEventListener('click', (e)=>{
    dtDia.disabled = true
    preencherSelect(divOperacoes, totais('OPERAÇÃO', filtrarDados({quinzena:'1ª Quinzena'})))
})

radQuinzena2.addEventListener('click', (e)=>{
    dtDia.disabled = true
    preencherSelect(divOperacoes, totais('OPERAÇÃO', filtrarDados({quinzena:'2ª Quinzena'})))
})

radQuinzena3.addEventListener('click', (e)=>{
    const dtRef = new Date(`${dtDia.value}T00:00:00`)
    const dtAux = new Date(dtRef.setMonth(dtRef.getMonth()+1))
    const dtUltimoDia = new Date(dtAux.setDate(dtAux.getDate()-1))
    dtDia.min = dtDia.value
    dtDia.max = `${dtUltimoDia.getFullYear()}-${("00"+(parseInt(dtUltimoDia.getMonth())+1)).slice(-2)}-${("00" + dtUltimoDia.getDate()).slice(-2)}`
    dtDia.disabled = false
    preencherSelect(divOperacoes, totais('OPERAÇÃO', filtrarDados({data:`${dtDia.value.split('-')[2]}/${dtDia.value.split('-')[1]}/${dtDia.value.split('-')[0]}`})))
})

dtDia.addEventListener('change',(e)=>{
    preencherSelect(divOperacoes, totais('OPERAÇÃO', filtrarDados({data:`${dtDia.value.split('-')[2]}/${dtDia.value.split('-')[1]}/${dtDia.value.split('-')[0]}`})))
})

cmdExibirEscala.addEventListener('click', (e)=>{
    e.preventDefault()
    const opr = document.getElementsByTagName('select')[0].value
    let quinzena = ''
    let data = ''
    let siape = ''
    let operacao = ''
    if(radQuinzena1.checked) {quinzena = `1ª Quinzena`}
    if(radQuinzena2.checked) {quinzena = `2ª Quinzena`}
    if(radQuinzena3.checked) {data = `${dtDia.value.split('-')[2]}/${dtDia.value.split('-')[1]}/${dtDia.value.split('-')[0]}`}
    if(radVoluntarioCom.checked) {siape = `-SV`}
    if(radVoluntarioSem.checked) {siape = `SV`}
    if(radVoluntarioTodos.cheked) {siape = ``}
    operacao = opr

    const par = {siape:siape, quinzena:quinzena, data:data, operacao:operacao}
    const objAlvo = filtrarDados(par)
    $info({msg:`Gerenciadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoJson.length)} cotas`, opt:0})
    $info({msg:`, Filtrados: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objAlvo.length)} cotas`, opt:1})
    if(!radVoluntarioCom.checked){
        const objSv = filtrarDados({siape:'SV', quinzena:quinzena, operacao:operacao, data:data})
        if(objSv.length > 0){
            $info({msg:`<br> Encontrados: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objSv.length)} 'Sem Voluntários'`, opt:1})
        }
    }
    if(objAlvo.length === 0){
        $info({msg:`A consulta não retornou dados`, opt:0})
        divResultado.innerHTML = ""
    }else{
        htmlConstruirEscala(objAlvo)
        //setClipboard(divResultado) // Não está levando as bordas...
    }
})

cmdCotaDobrada.addEventListener('click', (e)=>{
    e.preventDefault()
    cotaDobrada()
})

cmdExportarPdf.addEventListener('click', (e)=>{
    if (divResultado.innerHTML){
        setTimeout(()=>{
            if(confirm(`Imprimir PDF?`)) cmdGerarPdf()
        },200)
    }else{
        $info({msg:`Não há dados a serem convertidos para PDF.`, opt:0})
    }
})

cmdTotais.addEventListener('click', (e)=>{
    e.preventDefault()
    htmlConstruirTotalDeMilitaresEnvolvidos(dadoJson)
    $info({msg:`Cálculo com base em ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoJson.length)} registros do arquivo carregado`, opt:0})
})

cmdPesquisarPorSiape.addEventListener('click', (e)=>{
    e.preventDefault()

    const siape = txtSiape.value
    const par = {siape:siape}
    const objAlvo = filtrarDados(par)

    $info({msg:`Gerenciadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoJson.length)} cotas`, opt:0})
    $info({msg:`, Filtrados: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objAlvo.length)} cotas`, opt:1})

    if(objAlvo.length === 0){
        $info({msg:`A consulta não retornou dados`, opt:0})
    }else{
        htmlConstruirEscala(objAlvo)
    }
})

function controlesAtivos(estado) {
    fieldset1.disabled = estado
    fieldset2.disabled = estado
    fieldset3.disabled = estado
    fieldset4.disabled = estado
    cmdExibirEscala.disabled = estado
    cmdExportarPdf.disabled = estado
    cmdTotais.disabled = estado
    radQuinzena1.checked = true
    radVoluntarioCom.checked = true
}

function filtrarDados({ data, escaladoPor, grupo, gbm_destino, horario, lotacao, nome, operacao, operacao_tipo, quadro, quinzena, posto_grad, siape, sub_lotacao_local }) {
    
    //console.log(filtrarDados.arguments[0])

    if (!data) { data = "" }
    if (!escaladoPor) { escaladoPor = "" }
    if (!grupo) { grupo = "" }
    if (!gbm_destino) { gbm_destino = "" }
    if (!horario) { horario = "" }
    if (!lotacao) { lotacao = "" }
    if (!nome) { nome = "" }
    if (!operacao) { operacao = "" }
    if (!operacao_tipo) { operacao_tipo = "" }
    if (!quadro) { quadro = "" }
    if (!quinzena) { quinzena = "" }
    if (!posto_grad) { posto_grad = "" }
    if (!sub_lotacao_local) { sub_lotacao_local = "" }
    if (!siape) { 
        siape = "" 
    }else{
        if(siape.substr(0,1) === '-'){
            siape = siape.substr(1,siape.length)
            return dadoJson.filter((item) => {
                if (
                    item.SIAPE !== siape &&
                    item.LOTAÇÃO.indexOf(lotacao) > -1 &&
                    item.NOME.indexOf(nome) > -1 &&
                    item.POSTO_GRAD.indexOf(posto_grad) > -1 &&
                    item.QUADRO.indexOf(quadro) > -1 &&
                    item.ESCALADO.indexOf(escaladoPor) > -1 &&
                    item.QUINZENA.indexOf(quinzena) > -1 &&
                    item.OPERAÇÃO.indexOf(operacao) > -1 &&
                    item.DATA.indexOf(data) > -1 &&
                    item.GBM_DESTINO.indexOf(gbm_destino) > -1 &&
                    item.GRUPO.indexOf(grupo) > -1 &&
                    item.name_um.indexOf(operacao_tipo) > -1 &&
                    item.name_dois.indexOf(operacao) > -1 &&
                    item.name_tres.indexOf(data) > -1 &&
                    item.name_quatro.indexOf(horario) > -1 
                    ) {
                    return item
                }
            })
        }
    }

    return dadoJson.filter((item) => {
        if (
            item.SIAPE.indexOf(siape) > -1 &&
            item.LOTAÇÃO.indexOf(lotacao) > -1 &&
            item.NOME.indexOf(nome) > -1 &&
            item.POSTO_GRAD.indexOf(posto_grad) > -1 &&
            item.QUADRO.indexOf(quadro) > -1 &&
            item.ESCALADO.indexOf(escaladoPor) > -1 &&
            item.QUINZENA.indexOf(quinzena) > -1 &&
            item.OPERAÇÃO.indexOf(operacao) > -1 &&
            item.DATA.indexOf(data) > -1 &&
            item.GBM_DESTINO.indexOf(gbm_destino) > -1 &&
            item.GRUPO.indexOf(grupo) > -1 &&
            item.name_um.indexOf(operacao_tipo) > -1 &&
            item.name_dois.indexOf(operacao) > -1 &&
            item.name_tres.indexOf(data) > -1 &&
            item.name_quatro.indexOf(horario) > -1 
        ) {
            return item
        }
    })
}

function totais(atributoDePesquisa, obj) {
    const res = obj.reduce((acc, item) => {
        if (!acc[item[atributoDePesquisa]]) {
            acc[item[atributoDePesquisa]] = 1
        } else {
            acc[item[atributoDePesquisa]] = acc[item[atributoDePesquisa]] + 1
        }
        return acc
    }, {})
    return res
}

function somar({
    data, 
    escaladoPor, 
    grupo, 
    horario, 
    lotacao, 
    nome, 
    operacao, 
    operacao_tipo, 
    posto_grad, 
    quadro, 
    quinzena, 
    siape, 
    sub_lotacao_local
    }, obj) {
    const res = obj.reduce((acc, item) => {
        if (!data) { data = "" }
        if (!escaladoPor) { escaladoPor = "" }
        if (!grupo) { grupo = "" }
        if (!horario) { horario = "" }
        if (!lotacao) { lotacao = "" }
        if (!nome) { nome = "" }
        if (!operacao) { operacao = "" }
        if (!operacao_tipo) { operacao_tipo = "" }
        if (!posto_grad) { posto_grad = "" }
        if (!quadro) { quadro = "" }
        if (!quinzena) { quinzena = "" }
        if (!siape) { siape = "" }
        if (!sub_lotacao_local) { sub_lotacao_local = "" }
        
        if(
            item.SIAPE.indexOf(siape) > -1 &&
            item.LOTAÇÃO.indexOf(lotacao) > -1 &&
            item.NOME.indexOf(nome) > -1 &&
            item.POSTO_GRAD.indexOf(posto_grad) > -1 &&
            item.QUADRO.indexOf(quadro) > -1 &&
            item.ESCALADO.indexOf(escaladoPor) > -1 &&
            item.QUINZENA.indexOf(quinzena) > -1 &&
            item.OPERAÇÃO.indexOf(operacao) > -1 &&
            item.name_um.indexOf(operacao_tipo) > -1 &&
            item.name_dois.indexOf(operacao) > -1 &&
            item.name_tres.indexOf(data) > -1 &&
            item.name_quatro.indexOf(horario) > -1 &&
            item.name_cinco.indexOf(grupo) > -1 
        ){
            //console.log(item.SIAPE, item.VALOR)
            if(!acc[item.SIAPE]) {
                acc[item.SIAPE] = item.VALOR    
            } else {
                acc[item.SIAPE] =  acc[item.SIAPE] + item.VALOR
            }
            acc
        }
        return acc
    }, {})
    return res
}

function cotaDobrada(){
    divResultado.innerHTML = ""
    const arrDia = dadoJson.map((item) => `${item.DATA}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
    const table = document.createElement('table')
    table.innerHTML = `<tr><th>DIA</th><th>SIAPE</th><th>ACHADOS</th></tr>`
    for(let i = 0; i < arrDia.length; i++) {
        const objDia = dadoJson.filter((item)=>{if(item.DATA === arrDia[i]){return item}})
        const objTotalSiape = totais('SIAPE', objDia)
        for (const property in objTotalSiape) {
            const tr = document.createElement('tr')
            if(objTotalSiape[property]>1){
                tr.innerHTML = `<td>${arrDia[i]}</td><td style="text-align:center">${property}</td><td style="text-align:center">${objTotalSiape[property]}</td>`
                table.append(tr)
            }
        }
    }
    divResultado.append(table)
}

function htmlConstruirEscala(info) {
    divResultado.innerHTML = ""
    const table = document.createElement('table')
    let nivel1 = ''
    let nivel2 = ''
    let nivel34 = ''
    let nivel5 = ''

    for (let i = 0; i < info.length; i++) {
        if(info[i].name_um !== nivel1){
            _nivel1(info[i])
            nivel1 = info[i].name_um
            nivel2 = ''
        }
        if(info[i].name_dois !== nivel2){
            _nivel2(info[i])
            nivel2 = info[i].name_dois
            nivel34 = ''
        }
        if(info[i].name_tres + info[i].name_quatro !== nivel34){
            _nivel34(info[i])
            nivel34 = info[i].name_tres + info[i].name_quatro
            nivel5 = ''
        }
        if(info[i].name_cinco !== nivel5){
            _nivel5(info[i])
            nivel5 = info[i].name_cinco
            _incluirLinha(cabecalho)
        }
        _voluntario(info[i])
    }
    
    divResultado.append(table)
    
    function _nivel1(info){
        _incluirLinha(`<td colspan="7" class="nivel_um"><span class="name_um">${info.name_um}</span><span class="desc_um">${(info.desc_um === undefined ? '' : ' - ' + info.desc_um)}</span></td>`)
    }
    function _nivel2(info){
        _incluirLinha(`<td colspan="7" class="nivel_um"><span class="name_um">${info.name_dois}</span></td>`)
    }
    function _nivel34(info){
        _incluirLinha(`<td colspan="7" class="nivel_quatro"><span class="name_tres">${info.name_tres}</span> - <span class="name_quatro">${info.name_quatro}</span></td>`)
    }
    function _nivel5(info){
        _incluirLinha(`<td colspan="7" class="nivel_cinco"><span class="name_cinco">${info.name_cinco}</span></td>`)
    }
    function _voluntario(info){
        _incluirLinha(`<td class="label_data">${info.POSTO_GRAD}</td><td class="label_data" title="${info.ESCALADO}" style="text-align: left; ${(info.ESCALADO.indexOf('próprio')>-1 ? '' : 'color:#a00')}">${info.NOME}</td><td class="label_data">${info.SIAPE}</td><td class="label_data">${info.LOTAÇÃO}</td><td class="label_data">${info.QUADRO}</td><td class="label_data">${info.ALA}</td><td class="label_data"></td>`)
    }
    function _incluirLinha(txt){
        const tr = document.createElement('tr')
        tr.innerHTML = txt
        table.append(tr)
    }
}

const htmlConstruirTotalDeMilitaresEnvolvidos = (arrObj)=>{
    divResultado.innerHTML = ""
    const arrGrupo = arrObj.map((item) => `${item.GRUPO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
    for(let i = 0; i < arrGrupo.length; i++) {
        _criarTagGrupo(`GRUPO-${i}`, `${arrGrupo[i]}`)
        const objGbmDestino = arrObj.filter((item) => {if(item.GRUPO === arrGrupo[i] ){return item}})
        const arrGbmDestino = objGbmDestino.map((item) => `${item.GBM_DESTINO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
        for(let k = 0; k < arrGbmDestino.length; k++) {
            _criarTagGbmDestino(`GRUPO-${i}`, `GBM-${k}`, arrGbmDestino[k])
            _carregarSiape(i, arrGrupo, k, arrGbmDestino)
        }
    }
        
    _incluirCabecalhoParaPdf()

    function _incluirCabecalhoParaPdf(){
        const tbResultado = document.getElementById('tbResultado')
        const thisH1 = document.createElement('h1')
        thisH1.innerHTML = `MILITARES ENVOLVIDOS<br>${config.arquivo.split("-")[2]}/${config.arquivo.split("-")[0]}`
        thisH1.style.display = 'flexbox'
        thisH1.style.textAlign = 'center'
        thisH1.style.width = '100%'
        thisH1.style.marginBottom = '10px'
        thisH1.style.fontSize = '150%'
        divResultado.insertBefore(thisH1, tbResultado)
    }

    function _tipsOperacoes(arr){
        let txt = ''
        for(i = 0; i < arr.length; i++) {txt += arr[i] + '\n'}
        return txt
    }

    function _criarTagGrupo(codGrupo, strTexto){
        if (divResultado.childElementCount === 0) {
            divResultado.innerHTML = `<table class="tabelaDeResultado" id="tbResultado"></table><br>`
        }
        const tbResultado = document.getElementById("tbResultado")
        tbResultado.innerHTML += `
            <tbody id=${codGrupo} title="Cabecalho">
            <tr>
            <th rowspan="2"></th>
            <th class="thTotais" colspan=3></th>
            <th rowspan="2" class="thTotais"></th>
            </tr>
            <tr>
            <th class="thTotais"></th>
            <th class="thTotais"></th>
            <th class="thTotais"></th>
            </tr>
            <tr>
                <th colspan="5" class="name_tres">${strTexto}</th>
            </tr>
            </tbody>`
        if (codGrupo === 'GRUPO-0') {
            const tbodyGrupo = document.getElementById(codGrupo)
            tbodyGrupo.children[0].children[0].innerHTML = `OBM`
            tbodyGrupo.children[0].children[1].innerHTML = `TOTAIS`
            tbodyGrupo.children[1].children[0].innerHTML = `Cotas`
            tbodyGrupo.children[1].children[1].innerHTML = `Oficiais`
            tbodyGrupo.children[1].children[2].innerHTML = `Praças`
            tbodyGrupo.children[0].children[2].innerHTML = `SEI`
            tbodyGrupo.children[0].children[2].style.width = `300px`
        }else{
            const tBody = document.getElementById(codGrupo)
            tBody.removeChild(tBody.children[0])
            tBody.removeChild(tBody.children[0])
        }
    }

    function _criarTagGbmDestino(codGrupo, codGbmDestino, strTexto){
        const tbodyGrupo = document.getElementById(codGrupo)
        tbodyGrupo.innerHTML += `
            <tr id="${codGrupo}-${codGbmDestino}">
                <td onMouseOuver=''>${strTexto}</td>
                <td class="label_data"></td>
                <td class="label_data"></td>
                <td class="label_data"></td>
                <td class="label_data" style="height:20px"></td>
            </tr>`
    }

    function _carregarSiape(codGrupo, arrGrupo, codGbmDestino, arrGbmDestino){
        const strGrupo = arrGrupo[codGrupo]
        const strGbmDestino = arrGbmDestino[codGbmDestino]

        //Totalizando militares
        const objTodos = arrObj.filter((item) => {
            if(item.SIAPE !== 'SV' && item.GRUPO === strGrupo && item.GBM_DESTINO === strGbmDestino){return item}
        })
        const arrTotalGeral = objTodos.filter((elem, index, arr) => arr.indexOf(elem) === index)

        const arrTips = objTodos.map((item) => `${item.OPERAÇÃO}`).filter((elem, index, arr) => arr.indexOf(elem) === index)

        //Totalizando Praças
        const objPraca = arrObj.filter((item) => {
            if(item.SIAPE !== 'SV' && item.QUADRO.indexOf('QBMG')>-1 && item.GRUPO === strGrupo && item.GBM_DESTINO === strGbmDestino){return item}
        })
        const arrTotalPraca = objPraca.map((item) => `${item.SIAPE}`).filter((elem, index, arr) => arr.indexOf(elem) === index)
        //Totalizando Oficiais
        const objOficial = arrObj.filter((item) => {
            if(item.SIAPE !== 'SV' && item.QUADRO.indexOf('QOBM')>-1 && item.GRUPO === strGrupo && item.GBM_DESTINO === strGbmDestino){return item}
        })
        const arrTotalOficial = objOficial.map((item) => `${item.SIAPE}`).filter((elem, index, arr) => arr.indexOf(elem) === index)

        const tdGbmDestino = document.getElementById(`GRUPO-${codGrupo}-GBM-${codGbmDestino}`)
        tdGbmDestino.children[0].title = `${_tipsOperacoes(arrTips)}`
        tdGbmDestino.children[1].innerHTML = `${arrTotalGeral.length}`
        tdGbmDestino.children[2].innerHTML = `${arrTotalOficial.length}`
        tdGbmDestino.children[3].innerHTML = `${arrTotalPraca.length}`
    }

}

function preencherSelect(tag, obj){
    const aux = Object.keys(obj).sort()
    const sel = document.createElement("select")
    sel.append(new Option("(Há opções para seleção)", ""))
    aux.forEach((item)=>{
        // sel.append(new Option((item.length>78 ? `${item.substring(0, 78)}...` : item)), item )
        sel.append(new Option(item, item ))
    })
    tag.removeChild(tag.children[0])
    tag.append(sel)
}

function $info({msg, opt}){
    if(opt === 1){
        labStatus.innerHTML += msg
    } else {
        labStatus.innerHTML = msg
    }
}

function cmdGerarPdf(){
    const content = divResultado
    const options = {
        margin: [10,10,10,10],
        filename: `${config.arquivo}.pdf`,
        html2canvas:{scale: 2},
        jsPDF: {unit: "mm", format: "a4", orientation: "portrait"}
    }
    html2pdf().set(options).from(content).save()
}

function setClipboard(tag) {
    const text = tag.innerHTML
    // const type = "text/plain";
    const type = "text/html";
    const blob = new Blob([text], { type });
    const data = [new ClipboardItem({ [type]: blob })];
  
    navigator.clipboard.write(data).then(
      () => {
        /* success */
        console.log('Copiou!');
      },
      () => {
        /* failure */
        console.log('Falhou ao copiar!')
      },
    );
}

