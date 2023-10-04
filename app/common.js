const arrOrdemPostoGrad = ['CEL', 'TC', 'MAJ', 'CAP', '1 TEN', '2 TEN', 'ASP', 'ST', '1 SGT', '2 SGT', '3 SGT', 'CB', 'SD/1', 'SD/2']

const $ = tag => document.getElementById(tag)

const $ajax = ({urlDoArquivo, funcaoDeRetorno}) => {
    const url = urlDoArquivo
    const XmlReq = new XMLHttpRequest()
    XmlReq.open('GET', url, true)
    XmlReq.onreadystatechange = () => {
        if (XmlReq.readyState === 4) {
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

const $readFile = (input) => {
    let file = input.files[0]
    let reader = new FileReader()

    reader.readAsText(file)

    reader.onload = function () {avaliarDadoBruto({htmlRetornado:reader.result})}
    
    reader.onerror = function () {console.log(reader.error)}
}

function avaliarDadoBruto({htmlRetornado}) {
    try {
        const demora = Date.now()
        if(htmlRetornado === null){return}
        
        const parser = new DOMParser()
        let dadoBruto = []
        let funcaoAuxiliar = false
        
        dadoBruto = parser.parseFromString(htmlRetornado, 'text/html')
        const tipoRetorno = _testarArquivoDeOrigem()
        if( tipoRetorno === false ){return}
        if( tipoRetorno === 'Escalas' ){
            dadoBruto = dadoBruto.querySelector(".table_relatorio")
            dadoBruto = dadoBruto.children[0]
            dadoEscalasJson = prepararEscalasJSon(dadoBruto)
            $info({msg:`${dadoEscalasJson[0]["MÊS"]}/${dadoEscalasJson[0].DATA.split('/')[2]}, gerenciadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoEscalasJson.length)} cotas`, opt:'+'})
            conf.arquivo = `${dadoEscalasJson[0]["MÊS"]}/${dadoEscalasJson[0].DATA.split('/')[2]}`
            funcaoAuxiliar = inicializarEscalas
        }
        if( tipoRetorno === 'Faltas' ){
            dadoBruto = dadoBruto.querySelector(".div_form_faltas")
            dadoBruto = dadoBruto.children[0].children[0]
            dadoFaltasJson = prepararFaltasJSon(dadoBruto)
            $info({msg:`${_extrairMesExtenso(dadoFaltasJson[0].DATA)}/${dadoFaltasJson[0].DATA.split('/')[2]}, retornadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoFaltasJson.length)} faltas`, opt:'+'})
            funcaoAuxiliar = inicializarFaltas
        }
        if( tipoRetorno === 'Inscritos'){
            dadoBruto = dadoBruto.querySelector(".tbResumo")
            dadoBruto = dadoBruto.children[0]
            dadoInscritosJson = prepararInscritosJSon(dadoBruto)
            $info({msg:`${dadoEscalasJson[0]["MÊS"]}/${dadoEscalasJson[0].DATA.split('/')[2]}, retornados: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoInscritosJson.length)} inscritos`, opt:'+'})
            funcaoAuxiliar = inicializarInscritos
        }
        console.log('avaliarDadoBruto', tipoRetorno, (Date.now() - demora) + `ms`)
        if(funcaoAuxiliar){funcaoAuxiliar()}

        function _testarArquivoDeOrigem(){
            let ret = false
            if (dadoBruto.getElementsByTagName('fieldset')) {
                const or0 = Array.from(dadoBruto.getElementsByTagName('fieldset'))
                if (or0.length > 0) {
                    or0.forEach((el) => {
                        const or1 = el.children[0]
                        if (or1.innerHTML) {
                            const or2 = or1.innerHTML
                            if (or2.indexOf('Escalas') > -1) {
                                ret = 'Escalas'
                            }
                            if (or2.indexOf('Faltas') > -1) {
                                ret = 'Faltas'
                            }
                            if (or2.indexOf('Resumo da Escala') > -1) {
                                ret = 'Inscritos'
                            }
                        }
                    })
                }
            }  
            return ret
        }

    } catch (error) {
        console.log(error)
    }
}

function prepararEscalasJSon(dadosHtml) {
    let opr = {};
    let dadoEscalasJson = [];
    for (let i = 0; i < dadosHtml.childElementCount; i++) {
        const tr = dadosHtml.children[i];
        const filhos = tr.childElementCount;
        if (filhos === 1) {
            const td = tr.children[0];
            for (let j = 0; j < td.childElementCount; j++) {
                const span = td.children[j];
                opr[span.className] = span.innerHTML;
            }
        }
        if (filhos === 7) {
            if (tr.children[0].nodeName === "TD") {
                const obj = {};
                obj['_ID'] = i
                obj['POSTO_GRAD'] = `${_sanitizar(tr.children[0].innerHTML)}`,
                obj['NOME'] = `${_sanitizar(tr.children[1].innerHTML)}`,
                obj['ESCALADO'] = `${_sanitizar(tr.children[1].title)}`,
                obj['SIAPE'] = `${_sanitizar(tr.children[2].innerHTML)}`,
                obj['LOTAÇÃO'] = `${_sanitizar(tr.children[3].innerHTML)}`,
                obj['QUADRO'] = `${_sanitizar(tr.children[4].innerHTML)}`,
                obj['CIRCULO'] = `${_extrairCirculo(tr.children[4].innerHTML)}`,
                obj['ALA'] = `${_sanitizar(tr.children[5].innerHTML)}`,
                obj['GRUPO'] = _classificarGrupo(opr.name_dois),
                obj['GBM_DESTINO'] = _extrairGbm({ quatro: opr.name_quatro, um: opr.desc_um }),
                obj['HORA'] = _extrairHorario(opr.name_quatro),
                obj['LOCAL'] = '', //falta implementar
                obj['MÊS'] = _extrairMesExtenso(opr.name_tres),
                obj['QUINZENA'] = _extrairQuinzena(opr.name_tres),
                obj['DATA'] = opr.name_tres, //DATA
                obj['ASSINATURA'] = '',
                obj['TEMPO'] = _extrairTempo({ data: obj['DATA'], hora: obj['HORA'] }),
                obj['VALOR'] = _extrairValor(obj['TEMPO']),
                obj['name_tres'] = opr.name_tres, //DATA
                obj['name_quatro'] = opr.name_quatro, //HORA - OPERAÇÃO - GBM
                obj['desc_um'] = opr.desc_um, //SUB_LOTAÇÃO_LOCAL
                obj['name_um'] = opr.name_um, //OPERAÇÃO - GBM
                obj['OPERAÇÃO'] = opr.name_dois, //OPERAÇÃO - TIPO
                obj['name_dois'] = opr.name_dois, //OPERAÇÃO - TIPO
                obj['name_cinco'] = opr.name_cinco, // CATEGORIA
                obj['FALTA'] = false
                dadoEscalasJson.push(obj);
            }
        }
        if (filhos !== 1 && filhos !== 7) {
            alert('Alteração no padrão de gerenciamento.');
            break;
        }
    }

    return dadoEscalasJson;

    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "");
        retorno = retorno.replace("&nbsp;", "").trim();
        return retorno;
    }

    function _classificarGrupo(parametro) {
        let retorno = '';

        if (parametro.indexOf("REFORÇO") > -1) {
            retorno = "REFORÇO OPERACIONAL";
        } else if (parametro.indexOf("SEGURANÇA") > -1) {
            retorno = "SEGURANÇA NAS INSTRUÇÕES";
        } else if (parametro.indexOf("CHUVOSO") > -1) {
            retorno = "PERÍODO CHUVOSO";
        } else if (parametro.indexOf("VERDE") > -1) {
            retorno = "VERDE VIVO";
        } else if (parametro.indexOf("SABURO") > -1) {
            retorno = "SABURO ONOYAMA";
        } else if (parametro.indexOf("PARQUE NACIONAL") > -1) {
            retorno = "ÁGUA MINERAL DO PARQUE NACIONAL";
        } else if (parametro.toUpperCase().indexOf("CHUVOSO") > -1) {
            retorno = "PERÍODO CHUVOSO";
        } else {
            retorno = "EXTRAORDINÁRIO";
        }
        return retorno;
    }

    function _extrairGbm(parametro) {
        let retorno = parametro.quatro.split('-');
        retorno = retorno[1].trim();
        //---Acertar GBMs de destino------------------
        if (retorno === "HRC" || retorno === "HRT" || retorno === "IHBDF") {
            retorno = "GAEPH";
        }
        if (retorno.indexOf("Parque da Cidade") > -1) {
            retorno = "GAEPH";
        }
        if (retorno.indexOf("Parque de Águas Claras") > -1) {
            retorno = "GAEPH";
        }
        if (retorno.indexOf("GAVOP") > -1) {
            retorno = "GAVOP";
        }
        if (retorno === "Parque Ecológico Saburo Onoyama") {
            retorno = "2º GBM";
        }
        //---Acertar Operação Verde Vivo 2023---------
        if (retorno.indexOf("VERDE VIVO") > -1) {
            retorno = parametro.um;
        }

        return retorno;
    }

    function _extrairHorario(parametro) {
        let retorno = parametro.split('-');
        retorno = retorno[0].trim();
        return retorno;
    }

    function _extrairCirculo(parametro) {
        let retorno = '';
        if (parametro.indexOf("QBMG") > -1) {
            retorno = "Praça";
        }
        else if (parametro.indexOf("QOBM" > -1)) {
            retorno = "Oficial";
        }
        return retorno;
    }

    function _extrairQuinzena(parametro) {
        const dataDMY = parametro.split('/');
        const dia = dataDMY[0];
        const quinzena = (dia > 15 ? `2ª Quinzena` : `1ª Quinzena`);
        return quinzena;
    }


    function _extrairTempo(parametro) {
        const auxData = `${parametro.data.substr(6, 4)}-${parametro.data.substr(3, 2)}-${parametro.data.substr(0, 2)}`
        const auxHora = parametro.hora.toLowerCase()
        let vtr1 = undefined
        let retorno = ""
        if (auxHora.indexOf(' às ') > -1) {vtr1 = auxHora.split(' às ')}
        if (auxHora.indexOf(' à ') > -1) {vtr1 = auxHora.split(' à ')}
        if(Array.isArray(vtr1)){
            let ini = new Date(`${auxData}T${vtr1[0].replace('h', ':')}:00`)
            let fim = new Date(`${auxData}T${vtr1[1].replace('h', ':')}:00`)
            if (fim <= ini) {
                fim = new Date(fim.setDate(fim.getDate() + 1))
            }
            const auxTempo = (((fim - ini) / 1000) / 60) / 60
            retorno = auxTempo.toString();
        }
        return retorno
    }

    function _extrairValor(parametro) {
        return (parametro * 50).toString()
    }
}

function prepararFaltasJSon(dadosHtml) {
    let dadoFaltasJson=[]
    for (i = 0; i < dadosHtml.childElementCount; i++) {
        const obj = {}
        const tr = dadosHtml.children[i]
        if (tr.children[0].nodeName === "TD") {
            obj['OPERAÇÃO'] = `${_sanitizar(tr.children[0].innerHTML)}`
            obj['LOCAL'] = `${_sanitizar(tr.children[1].innerHTML)}`
            obj['DATA'] = `${_sanitizar(tr.children[2].innerHTML)}`
            obj['TURNO'] = `${_sanitizar(tr.children[3].innerHTML)}`
            obj['GRUPO'] = `${_sanitizar(tr.children[4].innerHTML)}`
            obj['POSTO'] = `${_sanitizar(tr.children[5].innerHTML)}`
            obj['NOME'] = `${_sanitizar(tr.children[6].innerHTML)}`
            obj['SIAPE'] = `${_sanitizar(tr.children[7].innerHTML)}`
            obj['LOTAÇÃO'] = `${_sanitizar(tr.children[8].innerHTML)}`
            obj['QUADRO'] = `${_sanitizar(tr.children[9].innerHTML)}`
            obj['ALA'] = `${_sanitizar(tr.children[10].innerHTML)}`
            obj['FALTA'] = `${_sanitizar(tr.children[11].innerHTML)}`

            dadoFaltasJson.push(obj)
        }
    }
    
    return dadoFaltasJson
        
    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "")
        retorno = retorno.replace("&nbsp;", "").trim()
        return retorno
    }
}

function prepararInscritosJSon(info) {
    let dadoInscritosJson = []
    let qtdColunasDias = info.children[0].children[8].colSpan
    for (i = 0; i < info.childElementCount; i++) {
        const obj = {}
        const tr = info.children[i]
        if (tr.children[0].nodeName === "TD") {
            obj['SIAPE'] = `${_sanitizar(tr.children[2].innerHTML)}`,
            obj['MES_REFERENCIA'] = `${_sanitizar(tr.children[1].innerHTML)}`,
            obj['POSTO_GRAD'] = `${_sanitizar(tr.children[3].innerHTML)}`,
            obj['NOME'] = `${_sanitizar(tr.children[4].innerHTML)}`,
            obj['LOTAÇÃO'] = `${_sanitizar(tr.children[5].innerHTML)}`,
            obj['QUADRO'] = `${_sanitizar(tr.children[6].innerHTML)}`,
            obj['ALA'] = `${_sanitizar(tr.children[7].innerHTML)}`,
            obj['CURSOS'] = `${_sanitizar(tr.children[qtdColunasDias + 9].innerHTML)}`,
            dadoInscritosJson.push(obj)
        }
    }

    return dadoInscritosJson
        
    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "")
        retorno = retorno.replace("&nbsp;", "").trim()
        return retorno
    }
}

function filtrarEscalasJson({ assinatura, data, escaladoPor, falta, grupo, gbm_destino, horario, lotacao, nome, operacao, operacao_tipo, quadro, quinzena, posto_grad, siape, sub_lotacao_local, tempo }) {
    
    let objAux = dadoEscalasJson.filter((e)=>{return e})

    if (assinatura!==undefined) {
        objAux = objAux.filter((e)=>{if(e.ASSINATURA.indexOf(assinatura)>-1){return e}})
    }
    if (data!==undefined) {
        objAux = objAux.filter((e)=>{if(e.DATA.indexOf(data) > -1){return e}})
    }
    if (escaladoPor!==undefined) {
        if(escaladoPor === 'compulsória'){
            objAux = objAux.filter((e)=>{if(e.ESCALADO.split('-').length===3){return e}})
        }else if(escaladoPor === 'próprio'){
            objAux = objAux.filter((e)=>{if(e.ESCALADO.split('-').length===2){return e}})
        }else{
            objAux = objAux.filter((e)=>{if(e.ESCALADO.indexOf(escaladoPor) > -1){return e}})
        }
    }
    if (falta!==undefined) {
        objAux = objAux.filter((e)=>{if(e.FALTA === falta){return e}})
    }
    if (grupo!==undefined) {
        objAux = objAux.filter((e)=>{if(e.GRUPO.indexOf(grupo) > -1){return e}})
    }
    if (gbm_destino!==undefined) {
        objAux = objAux.filter((e)=>{if(e.GBM_DESTINO.indexOf(gbm_destino) > -1){return e}})
    }
    if (horario!==undefined) {
        objAux = objAux.filter((e)=>{if(e.HORA.indexOf(horario) > -1){return e}})
    }
    if (lotacao!==undefined) {
        objAux = objAux.filter((e)=>{if(e.LOTAÇÃO.indexOf(lotacao) > -1){return e}})
    }
    if (nome!==undefined) {
        objAux = objAux.filter((e)=>{if(e.NOME.indexOf(nome) > -1){return e}})
    }
    if (operacao!==undefined) {
        if(operacao === ''){
            objAux = objAux.filter((e)=>{if(e.OPERAÇÃO.indexOf(operacao) > -1){return e}})
        }else{
            objAux = objAux.filter((e)=>{if(e.OPERAÇÃO === operacao){return e}})
        }
    }
    if (operacao_tipo!==undefined) {
        objAux = objAux.filter((e)=>{if(e.name_um.indexOf(operacao_tipo) > -1){return e}})
    }
    if (quadro!==undefined) {
        objAux = objAux.filter((e)=>{if(e.QUADRO.indexOf(quadro) > -1){return e}})
    }
    if (quinzena!==undefined) {
        objAux = objAux.filter((e)=>{if(e.QUINZENA.indexOf(quinzena) > -1){return e}})
    }
    if (posto_grad!==undefined) {
        objAux = objAux.filter((e)=>{if(e.POSTO_GRAD.indexOf(posto_grad) > -1){return e}})
    }
    if (sub_lotacao_local!==undefined) {
        objAux = objAux.filter((e)=>{if(e.desc_um.indexOf(sub_lotacao_local) > -1){return e}})
    }
    if (siape!==undefined) {
        if(siape.substr(0,1) === '-'){
            siape = siape.substr(1,siape.length)
            objAux = objAux.filter((item) => {if (item.SIAPE !== siape) {return item}})
        }else{
            objAux = objAux.filter((e)=>{if(e.SIAPE.indexOf(siape)>-1){return e}})
        }
    }
    if (tempo!==undefined) {
        tempo = tempo.toString()
        if(tempo.indexOf('12/24') > -1){
            objAux = objAux.filter((e)=>{if(e.TEMPO=='12' || e.TEMPO == '24'){return e}})
        }else{
            objAux = objAux.filter((e)=>{if(e.TEMPO.indexOf(tempo)>-1){return e}})
        }
    }
        
    return objAux
}

function filtrarFaltasJson({ data, lotacao, nome, operacao, quadro, posto, siape, turno }) {

    if (!data) { data = "" }
    if (!lotacao) { lotacao = "" }
    if (!nome) { nome = "" }
    if (!operacao) { operacao = "" }
    if (!quadro) { quadro = "" }
    if (!posto) { posto = "" }
    if (!siape) { siape = "" }
    if (!turno) { turno = "" }

    return dadoFaltasJson.filter((item) => {
        if (
            item.DATA.indexOf(data) > -1 &&
            item.LOTAÇÃO.indexOf(lotacao) > -1 &&
            item.NOME.indexOf(nome) > -1 &&
            item.OPERAÇÃO.indexOf(operacao) > -1 &&
            item.QUADRO.indexOf(quadro) > -1 &&
            item.POSTO.indexOf(posto) > -1 &&
            item.SIAPE.indexOf(siape) > -1 &&
            item.TURNO.indexOf(turno) > -1
        ) {
            return item
        }
    })
}

function filtrarInscritosJson({ lotacao, nome, quadro, posto_grad, siape }) {
    
    if (!lotacao) { lotacao = "" }
    if (!nome) { nome = "" }
    if (!quadro) { quadro = "" }
    if (!posto_grad) { posto_grad = "" }
    if (!siape) { siape = "" }

    return dadoInscritosJson.filter((item) => {
        if (
            item.SIAPE.indexOf(siape) > -1 &&
            item.LOTAÇÃO.indexOf(lotacao) > -1 &&
            item.NOME.indexOf(nome) > -1 &&
            item.POSTO_GRAD.indexOf(posto_grad) > -1 &&
            item.QUADRO.indexOf(quadro) > -1
        ) {
            return item
        }
    })
}

function alterarDuracao(criteriosDeConsulta, dadosParaAlteracao) {
    try {
        const par = JSON.parse(criteriosDeConsulta)
        const objAux = filtrarEscalasJson(par)
        const arrAux = objAux.map((item) => { return item._ID })
        for (let i = 0; i < dadoEscalasJson.length; i++) {
            if (arrAux.includes(dadoEscalasJson[i]._ID)) {
                dadoEscalasJson[i].VALOR = dadosParaAlteracao.valor
                dadoEscalasJson[i].TEMPO = dadosParaAlteracao.tempo
            }
        }
        cmdExibirPlanilha.click()
    } catch (error) {
        $info({msg:error, opt:'+a'})
    }
}

function tratarFaltas() {
    if(dadoEscalasJson.length===0 || dadoFaltasJson.length===0){
        return
    }
    if(dadoEscalasJson[0].DATA.split("/")[1] !== dadoFaltasJson[0].DATA.split("/")[1]){
        $info({msg:`Períodos incompatívies para tratar faltas`, opt:`+a`})
        return
    }
    let contador = 0
    dadoEscalasJson.forEach((elm)=>{
        const filtroTurno = filtrarFaltasJson({siape:elm.SIAPE, data:elm.DATA, turno: elm.HORA})
        if(filtroTurno.length > 0){
            elm.ASSINATURA = 'FALTOU'
            elm.FALTA = true
            contador = contador + 1
        }
    })
    $info({msg:`, atribuídas: ${contador}`, opt:`+`})
}

function totais(campoDePesquisa, obj) {
    const res = obj.reduce((acc, item) => {
        if (!acc[item[campoDePesquisa]]) {
            acc[item[campoDePesquisa]] = 1
        } else {
            acc[item[campoDePesquisa]] = acc[item[campoDePesquisa]] + 1
        }
        return acc
    }, {})
    return res
}

function cotaDobrada(tag) {
    tag.innerHTML = ""
    const arrDia = dadoEscalasJson.map((item) => `${item.DATA}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
    const table = document.createElement('table')
    table.innerHTML = `<tr><th>DIA</th><th>SIAPE</th><th>ACHADOS</th></tr>`
    for(let i = 0; i < arrDia.length; i++) {
        const objDia = dadoEscalasJson.filter((item)=>{if(item.DATA === arrDia[i]){return item}})
        const objTotalSiape = totais('SIAPE', objDia)
        for (const property in objTotalSiape) {
            const tr = document.createElement('tr')
            if(objTotalSiape[property]>1){
                tr.innerHTML = `<td>${arrDia[i]}</td><td style="text-align:center">${property}</td><td style="text-align:center">${objTotalSiape[property]}</td>`
                table.append(tr)
            }
        }
    }
    tag.append(table)
}

function preencherSelect(tag, obj) {
    const aux = Object.keys(obj).sort()
    if(tag.children[0].id !== ''){
        const sel = document.getElementById(tag.children[0].id)
        _limparSelect(sel)
        sel.append(new Option("(Há opções para seleção)", ""))
        aux.forEach((item)=>{
            sel.append(new Option(item, item ))
        })
    }
    else{
        const sel = document.createElement("select")
        sel.append(new Option("(Há opções para seleção)", ""))
        aux.forEach((item)=>{
            sel.append(new Option(item, item )) // sel.append(new Option((item.length>78 ? `${item.substring(0, 78)}...` : item)), item )
        })
        tag.removeChild(tag.children[0])
        tag.append(sel)
    }
    function _limparSelect(sel){
        for(let i = sel.length-1; i >= 0; i--){
            sel.removeChild(sel.item(i))
        }
    }
}

function gerarPdf(tag) {
    const content = tag
    const options = {
        margin: [10,10,10,10],
        filename: `${conf.arquivo}.pdf`,
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

function atualizarSelectEscala(grupo){
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({siape:'-SV', grupo})))
}

function atualizarSelectPlanilha({tag, grupo, operacao}){
    if (tag === selPlanilhaGrupo.id){
        preencherSelect(divPlanilhaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({siape:'-SV', grupo:grupo})))
        preencherSelect(divPlanilhaTempo, totais('TEMPO', filtrarEscalasJson({siape:'-SV', grupo:grupo})))
    }
    if(tag === selPlanilhaOperacao.id){
        preencherSelect(divPlanilhaTempo, totais('TEMPO', filtrarEscalasJson({siape:'-SV', grupo:grupo, operacao:operacao})))
    }
}

function ordenarPorNome(obj){
    const aux = obj.sort(compararDados);
    return aux
    function compararDados(a, b) {
        return a.NOME - b.NOME;
    }
}

function _extrairMesExtenso(dataPtBr) {
    const dataDMY = dataPtBr.split('/');
    const mes = dataDMY[1];
    let res = '';
    if (mes === '01') { res = `Janeiro`; }
    if (mes === '02') { res = `Fevereiro`; }
    if (mes === '03') { res = `Março`; }
    if (mes === '04') { res = `Abril`; }
    if (mes === '05') { res = `Maio`; }
    if (mes === '06') { res = `Junho`; }
    if (mes === '07') { res = `Julho`; }
    if (mes === '08') { res = `Agosto`; }
    if (mes === '09') { res = `Setembro`; }
    if (mes === '10') { res = `Outubro`; }
    if (mes === '11') { res = `Novembro`; }
    if (mes === '12') { res = `Dezembro`; }
    conf.mes = mes;
    return res;
}

function fncEditarCota(id){
    $ajax({urlDoArquivo:'editar.html', funcaoDeRetorno:(conteudoHtml)=>{
        const div = document.createElement('div')
        div.id = id.toString()
        div.className= "divDialogoEdicao"
        div.innerHTML = conteudoHtml
        $('divParametros').append(div)
        $('btnEditarUpdate').addEventListener('click', (e)=>{
            fncCarregarDadosParaAlteracao(id)
        })
        $('btnEditarCancel').addEventListener('click', (e)=>{
            $(id.toString()).parentNode.removeChild($(id.toString()))
        })
    }})

    const timerDeAlteracao = setInterval(() => {
        if($('txtEditarId')){
            clearInterval(timerDeAlteracao)
            const id = parseInt(document.querySelector('.divDialogoEdicao').id)
            fncCarregarDadosParaAlteracao(id)
        }
    }, 10)
}

function fncCarregarDadosParaAlteracao(id){
    for(let i = 0; i < dadoEscalasJson.length; i++){
        if(dadoEscalasJson[i]._ID === id){
            $('txtEditarId').value = dadoEscalasJson[i]._ID
            $('txtEditarOperacao').value = dadoEscalasJson[i].OPERAÇÃO
            $('txtEditarDataHora').value = `${dadoEscalasJson[i].name_tres} - ${dadoEscalasJson[i].name_quatro}`
            $('txtEditarPostoGrad').value = dadoEscalasJson[i].POSTO_GRAD
            $('txtEditarQuadroQbmg').value = dadoEscalasJson[i].QUADRO
            $('txtEditarNome').value = dadoEscalasJson[i].NOME
            $('txtEditarSiape').value = dadoEscalasJson[i].SIAPE
            $('txtEditarLotacao').value = dadoEscalasJson[i].LOTAÇÃO
            $('selEditarFalta').value = dadoEscalasJson[i].FALTA
            break
        }
    }
}

const htmlConstruirEscala = (info) => {
    divResultado.innerHTML = ""

    const table = document.createElement('table')
    const cabecalho = `<td class="label_data_th">POSTO/GRAD</td><td class="label_data_th">NOME</td><td class="label_data_th">SIAPE</td><td class="label_data_th">LOTAÇÃO</td><td class="label_data_th">QUADRO</td><td class="label_data_th">ALA</td><td class="label_data_th">ASSINATURA</td>`

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
        _incluirLinha(`<td class="label_data">${info.POSTO_GRAD}</td><td class="label_data${((info.ESCALADO.indexOf('próprio') === -1 && info.ESCALADO !== '') ? ' escalaCompulsoria' : '')}" title="${info.ESCALADO}">${info.NOME}</td><td class="label_data" ondblclick = fncEditarCota(${info._ID})>${info.SIAPE}</td><td class="label_data">${info.LOTAÇÃO}</td><td class="label_data">${info.QUADRO}</td><td class="label_data">${info.ALA}</td><td class="label_data${(info.ASSINATURA.indexOf('FALTOU')>-1 ? ' faltou' : '')}">${info.ASSINATURA}</td>`)
    }
    function _incluirLinha(stringHtml){
        const tr = document.createElement('tr')
        tr.innerHTML = stringHtml
        table.append(tr)
    }
}

const htmlConstruirTotalDeMilitaresEnvolvidos = (arrObj) => {
    divResultado.innerHTML = ""

    const arrOrdemGbm = _criarOrdemGbm()

    const arrGrupo = arrObj.map((item) => `${item.GRUPO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)})
    for(let i = 0; i < arrGrupo.length; i++) {
        _criarTagGrupo(`GRUPO-${i}`, `${arrGrupo[i]}`)
        const objGbmDestino = arrObj.filter((item) => {if(item.GRUPO === arrGrupo[i]){return item}})
        const arrGbmDestino = objGbmDestino.map((item) => `${item.GBM_DESTINO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort((a,b)=>{
            let x = -1, y = -1
            arrOrdemGbm.forEach((e, i) => { if (a.indexOf(e) >- 1 ) { x = i} })
            arrOrdemGbm.forEach((e, i) => { if (b.indexOf(e) > -1) { y = i } })
            if(x === -1 && y ===-1){ return 0 }
            if(x === -1 && y > -1){ return 1 }
            if(x > -1 && y === -1){ return -1 }
            if(x > -1 && y > -1){ return x - y }
        })

        for(let k = 0; k < arrGbmDestino.length; k++) {
            _criarTagGbmDestino(`GRUPO-${i}`, `GBM-${k}`, arrGbmDestino[k])
            _carregarSiape(i, arrGrupo, k, arrGbmDestino)
        }
    }
        
    _incluirCabecalhoParaPdf()

    
    if (divResultado.innerHTML){
        setTimeout(()=>{
            if(confirm(`Deseja baixar esses dados convertidos em um arquivo PDF?`)) gerarPdf(divResultado)
        },500)
    }else{
        $info({msg:`Não há dados a serem convertidos para PDF.`, opt:`+a`})
    }


    function _incluirCabecalhoParaPdf(){
        const tbResultado = document.getElementById('tbResultado')
        const thisH1 = document.createElement('h1')
        thisH1.innerHTML = `MILITARES ENVOLVIDOS<br>${arrObj[0].MÊS}/${arrObj[0].DATA.split("/")[2]}`
        thisH1.style.display = 'flexbox'
        thisH1.style.textAlign = 'center'
        thisH1.style.width = '100%'
        thisH1.style.marginBottom = '10px'
        thisH1.style.fontSize = '150%'
        divResultado.insertBefore(thisH1, tbResultado)
    }

    function _criarOrdemGbm(){
        const ordemGbm = []
        for(let i = 1; i < 100; i++){
            const gbm = `${i}º GBM`
            const temp = filtrarEscalasJson({gbm_destino:gbm})
            if(temp.length>0){
                ordemGbm.push(gbm)
            }
        }
        return ordemGbm
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
            <tbody id=${codGrupo}>
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

const htmlConstruirTotalDeMilitaresEscalados = (arrObj) => {
    
    let par = parametroEscala()

    divResultado.innerHTML = ""
    let contabilizar_total = 0
    const arrOperacao = arrObj.map((item) => `${item.OPERAÇÃO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
    const table = document.createElement('table')
    table.append(_cabecalho1())
    table.append(_cabecalho2())
    for(let i = 0; i < arrOperacao.length; i++){
        par.operacao = arrOperacao[i]
        const objOperacao = filtrarEscalasJson(par)
        if (objOperacao.length > 0){
            table.append(_carregarTotais(objOperacao))
            contabilizar_total = contabilizar_total + ((objOperacao[0].OPERAÇÃO.indexOf(`24H`) > -1) ? objOperacao.length * 2 : objOperacao.length)
        }
    }
    table.append(_rodape(contabilizar_total))
    divResultado.append(table)

    function _cabecalho1() {
        const tr = document.createElement('tr')
        tr.innerHTML = `<th colspan="3">RESUMO DA ESCALA</th>`
        return tr
    }
    function _cabecalho2() {
        const tr = document.createElement('tr')
        tr.innerHTML = `<th>OPERAÇÃO</th>` +
            `<th>CARGA<br>HOR.</th>` +
            `<th>TOTAL</th>`
        return tr
    }
    function _carregarTotais(obj) {
        const tr = document.createElement('tr')
        const totalDeCotas = ((obj[0].OPERAÇÃO.indexOf(`24H`) > -1) ? 
            `${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(obj.length) * 2} (${obj.length}x2)` : 
            `${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(obj.length)}`
        ) 
        tr.innerHTML = `<td style="text-align:left">${obj[0].OPERAÇÃO}</td>` + 
            `<td style="text-align:center">${obj[0].TEMPO}h</td>` + 
            `<td style="text-align:center">${totalDeCotas}</td>`
        return tr
    }
    function _rodape(totalGeral) {
        const tr = document.createElement('tr')
        tr.innerHTML = `<th colspan="2">TOTAL GERAL DE COTAS</th>` +
            `<th>${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(totalGeral)}</th>`
        return tr
    }
}

const htmlConstuirFaltasPorDia = (par) => {
    const objTotaisDeFaltasPorDia = totais(par,dadoFaltasJson)
    const arrTotaisDeFaltasPorDia = Object.keys(totais(par,dadoFaltasJson)).sort()
    const table = document.createElement('table')
    const cabecalho = `<tr>` + 
                      `<td colspan="2" class="label_data_th">RESUMO SOBRE FALTAS</td>` + 
                      `</tr>` + 
                      `<tr>` + 
                      `<td class="label_data_th">${par}</td>` + 
                      `<td class="label_data_th">QTD.</td>` + 
                      `</tr>`
    let totalizar = 0
    
    table.innerHTML = cabecalho
    
    divResultado.innerHTML = ""
    arrTotaisDeFaltasPorDia.forEach((elm)=>{
        const tr = document.createElement('tr')
        tr.innerHTML = `<td class="label_data">${elm}</td><td class="label_data">${objTotaisDeFaltasPorDia[elm]}</td>`
        table.append(tr)
        totalizar = totalizar + objTotaisDeFaltasPorDia[elm]
    })
    const resumo = `<td class="label_data_th">TOTAL GERAL</td><td class="label_data_th">${totalizar}</td>`
    const tr = document.createElement('tr')
    tr.innerHTML = resumo
    table.append(tr)
    divResultado.append(table)
}

const htmlConstruirTabelaInscritos = () => {
    divResultado.innerHTML = ""
    const table = document.createElement('table')
    table.append(_cabecalho1())
    table.append(_cabecalho2())
    let indice = 0
    let mesDeReferencia = ''
    for (let i = 0; i < arrOrdemPostoGrad.length; i++) {
        const objAux =  _ordenarDados(filtrarInscritosJson({ posto_grad: arrOrdemPostoGrad[i] }))
        if(objAux.length > 0){
            if(mesDeReferencia === ''){ mesDeReferencia = objAux[i].MES_REFERENCIA }
            for(j = 0; j < objAux.length; j++){
                table.append(_incluirDado(objAux[j], ++indice))
            }
        }
    }

    divResultado.append(table)
    $('thMesReferenciaInscritos').innerHTML = mesDeReferencia

    function _cabecalho1(){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_th" colspan="7" id="thMesReferenciaInscritos"></th>`
        return tr
    }
    function _cabecalho2(){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_th"></th>` + 
        `<th class="label_th">SIAPE</th>` + 
        `<th class="label_th">POSTO/GRAD</th>` + 
        `<th class="label_th">NOME</th>` + 
        `<th class="label_th">LOTAÇÃO</th>` + 
        `<th class="label_th">QUADRO</th>` + 
        `<th class="label_th">ALA</th>`
        return tr
    }
    function _incluirDado(aux, i){
        const tr = document.createElement('tr')
        tr.innerHTML = `<td class="label_data">${i}</td>` + 
        `<td class="label_data">${aux.SIAPE}</td>` + 
        `<td class="label_data">${aux.POSTO_GRAD}</td>` + 
        `<td class="label_data" style="text-align: left">${aux.NOME}</td>` + 
        `<td class="label_data">${aux.LOTAÇÃO}</td>` + 
        `<td class="label_data">${aux.QUADRO}</td>` + 
        `<td class="label_data">${aux.ALA}</td>`
        return tr

    }
    function _ordenarDados(obj){
        const aux = obj.sort(compararDados);
        return aux
        function compararDados(a, b) {
            return a.NOME - b.NOME;
        }
    }
}

const htmlConstruirGrade = (arrObj) => {

    divResultado.innerHTML = ''

    const col = Object.keys(arrObj[0])
    const table = document.createElement('table')

    table.append(_cabecalho())
    for (let i = 0; i < arrObj.length; i++) {
        const item = arrObj[i];
        table.append(_registro(item, i+1))
    }
    divResultado.append(table)
    
    function _cabecalho(){
        const tr = document.createElement('tr')
        const tdNumeracao = document.createElement('td')
        tr.append(tdNumeracao)
        col.forEach((e)=>{
            const td = document.createElement('th')
            td.innerHTML = e
            tr.append(td)
        })
        return tr
    }
    
    function _registro(item, numerador){
        const tr = document.createElement('tr')
        const tdNumerador = document.createElement('td')
        tdNumerador.innerHTML = numerador
        tr.append(tdNumerador)
        for (const key in item) {
            if (item.hasOwnProperty.call(item, key)) {
                const elm = item[key];
                const td = document.createElement('td')
                td.innerHTML = elm
                tr.append(td)
            }
        }
        return tr
    }
}

const htmlConstruirPlanilha = (arrObj) => {
    
    divResultado.innerHTML = ''
    if(arrObj[0] === undefined){
        $info({msg:`Não há dados a serem processados`, opt:`+a`})
        return
    }
    const objOper = totais('OPERAÇÃO',arrObj)
    const mesAno = (`${_extrairMesExtenso(arrObj[0].DATA)}/${arrObj[0].DATA.split('/')[2]}`).toUpperCase()
    
    let totalDeColunasDias = _qtdMaxColunasParaDias(arrObj)

    const cotasTotal = arrObj.length
    let militaresTotal = 0
    let contador = 0
    let valorTotal = 0
    
    const table = document.createElement('table')
    table.append(_cabecalhoLinha1(totalDeColunasDias))
    table.append(_cabecalhoLinha2(totalDeColunasDias))
    table.append(_cabecalhoLinha3(totalDeColunasDias))
    for(let i = 0; i < arrOrdemPostoGrad.length; i++){
        objPosto = arrObj.map((item)=>{return {
                SIAPE:item.SIAPE, NOME:item.NOME, POSTO_GRAD:item.POSTO_GRAD,DATA:item.DATA, TEMPO:item.TEMPO, VALOR:item.VALOR, FALTA:item.FALTA, OPERAÇÃO:item.OPERAÇÃO
            }})
        .filter((item)=>{if(item.POSTO_GRAD===arrOrdemPostoGrad[i]){return item}})
        if(objPosto.length > 0){
            const arrSiape = objPosto.map((item) => `${item.SIAPE}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
            for(let j = 0; j < arrSiape.length; j++){
                objSiape = objPosto.filter((item)=>{if(item.SIAPE === arrSiape[j]){return item}}).sort((a,b)=>{a.DATA < b.DATA})
                table.append(_linhasContendoDados(objSiape))
            }
        }
    }
    table.append(_rodapeLinha1(totalDeColunasDias))
    table.append(_rodapeLinha2(totalDeColunasDias))
    table.append(_rodapeLinha3(totalDeColunasDias))
    
    divResultado.append(table)
    $info({msg:`Planilha processada: ${militaresTotal} militares e ${cotasTotal} cotas`, opt:`+n`})
    
    function _cabecalhoLinha1(col){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_data_th" colspan='${col+6}'>PLANILHA DE PAGAMENTO DO SERVIÇO VOLUNTÁRIO - ${mesAno}` + 
                       _qtdOperacaoEmHtml(objOper) + 
                       `</th>`
        return tr
        function _qtdOperacaoEmHtml(objOper){
            let result = '<br>'
            for (const key in objOper) {
                if (Object.hasOwnProperty.call(objOper, key)) {
                    result = result + `<br>${key}`
                }
            }
            return result
        }
    }
    
    function _cabecalhoLinha2(col){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_data_th" rowspan='2'>Seq</th>` + 
                       `<th class="label_data_th" rowspan='2'>POSTO/GRAD.</th>` + 
                       `<th class="label_data_th" rowspan='2'>NOME</th>` + 
                       `<th class="label_data_th" rowspan='2'>SIAPE</th>` + 
                       `<th class="label_data_th" colspan='${col+1}'>SERVIÇO VOLUNTÁRIO</th>` + 
                       `<th class="label_data_th" rowspan='2'>VALOR</th>`
        return tr
    }

    function _cabecalhoLinha3(col){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_data_th" colspan='${col}'>Dia${(col>1?'s':'')}</th>` + 
                       `<th class="label_data_th">Horas<br>Trab.</th>`
        return tr
    }

    function _linhasContendoDados(obj){
        if(obj[0]==undefined){
            console.log(obj)
            return
        }
        contador = contador + 1
        militaresTotal = contador
        const tr = document.createElement('tr')

        const tdContador = document.createElement('td')
        const tdPosto = document.createElement('td')
        const tdNome = document.createElement('td')
        const tdSiape = document.createElement('td')
        const tdTempo = document.createElement('td')
        const tdValor = document.createElement('td')
        
        tdContador.className = "label_data"
        tdPosto.className = "label_data"
        tdSiape.className = "label_data"
        tdTempo.className = "label_data"
        tdValor.className = "label_data"

        let auxTempo = 0
        let auxValor = 0
        
        tdContador.innerHTML = contador
        tdPosto.innerHTML = obj[0].POSTO_GRAD
        tdNome.innerHTML = obj[0].NOME
        tdSiape.innerHTML = obj[0].SIAPE
        
        tr.append(tdContador)
        tr.append(tdPosto)
        tr.append(tdNome)
        tr.append(tdSiape)
        for(let l = 0; l < totalDeColunasDias; l++){
            const tdDia = document.createElement('td')
            tdDia.style.textAlign = "center"
            if(obj[l] !== undefined){
                tdDia.innerHTML = obj[l].DATA.split('/')[0]
                auxTempo = auxTempo + parseInt(obj[l].TEMPO)
                auxValor = auxValor + parseInt(obj[l].VALOR)
                // if(obj[l].TEMPO === '24'){tdDia.style.backgroundColor = '#99f'}
                if(obj[l].FALTA === true){tdDia.style.backgroundColor = '#faa'}
                tdDia.title = obj[l].OPERAÇÃO
                const tdOutroDia = tdDia.cloneNode(true)
                if (obj[l].TEMPO === '24'){tr.append(tdOutroDia)}
            }
            if(tr.childElementCount<totalDeColunasDias+4){tr.append(tdDia)}
        }
        valorTotal = valorTotal + auxValor
        tdTempo.innerHTML = auxTempo
        tdValor.innerHTML = auxValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

        tr.append(tdTempo)
        tr.append(tdValor)

        return tr
    }

    function _rodapeLinha1(col){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_data_th" colspan='${col+5}'>TOTAL GERAL DA PALILHA</th><th class="label_data_th">${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</th>`
        return tr
    }

    function _rodapeLinha2(col){
        const tr = document.createElement('tr')
        const timeslap = Date.now()
        const dataDoDia = new Date(timeslap)
        tr.innerHTML = `<th class="label_data" style="text-align:right" colspan='${col+6}'>Taguatinga-DF em, ${formatDate(dataDoDia, 'dd de mmm de aaaa')}</th>`
        return tr
    }
    
    function _rodapeLinha3(col){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_data_th" colspan='${col+6}'>TOTAL DE COTAS NESTA PLANILHA: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(cotasTotal)}</th>`
        return tr
    }

    function formatDate(date, format) {
        const map = {
            mm: date.getMonth() + 1,
            mmm: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()],
            dd: date.getDate(),
            aa: date.getFullYear().toString().slice(-2),
            aaaa: date.getFullYear()
        }
        return format.replace(/dd|mmm|mm|aaaa|aa/gi, matched => map[matched])
    }

    function _qtdMaxColunasParaDias(objAux){
        const objQtdCotas = objAux.reduce((acc, item) => {
            if (!acc[item.SIAPE]) {
                acc[item.SIAPE] = (item.TEMPO === '24' ? 2 : 1)
            } else {
                acc[item.SIAPE] = acc[item.SIAPE] + (item.TEMPO === '24' ? 2 : 1)
            }
            return acc
        }, {})
    
        let totalDeColunasDias = 0
        for (const key in objQtdCotas) {
            if (Object.hasOwnProperty.call(objQtdCotas, key)) {
                const elm = objQtdCotas[key]
                if (elm > totalDeColunasDias){
                    if(key.indexOf('SV') === -1)totalDeColunasDias = elm
                }
            }
        }
        return totalDeColunasDias
    }
}
























const estudar = {
    baixarTexto: function(event) {
        event.preventDefault()
        let data = document.querySelector('#texto').value
        let blob = new Blob([data], { type: 'application/json;charset=utf-8;' })
        const anchor = window.document.createElement('a')
        anchor.href = window.URL.createObjectURL(blob)
        anchor.download = 'export.json'
        anchor.click()
        window.URL.revokeObjectURL(anchor.href)
    },
    baixarFetch: function(event) {
        event.preventDefault()
        fetch('like.svg').then(async (result) => {
            const blob = await result.blob()
            const anchor = window.document.createElement('a')
            anchor.href = window.URL.createObjectURL(blob)
            anchor.download = 'imagem.svg'
            anchor.click()
            window.URL.revokeObjectURL(anchor.href)
        })
    },
    baixarImagem: function(event) {
        event.preventDefault()
        canvas.toBlob(blob => {
            const anchor = window.document.createElement('a')
            anchor.href = window.URL.createObjectURL(blob)
            anchor.download = 'export.jpg'
            anchor.click()
            window.URL.revokeObjectURL(anchor.href)
        }, 'image/jpeg', 0.9,)
    }
}
    