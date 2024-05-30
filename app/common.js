const arrOrdemPostoGrad = ['CEL', 'TC', 'MAJ', 'CAP', '1 TEN', '2 TEN', 'ASP', 'ST', '1 SGT', '2 SGT', '3 SGT', 'CB', 'SD/1', 'SD/2']

const $ = tag => document.getElementById(tag)

const $ajax = ({urlDoArquivo, funcaoDeRetorno}) => {
    try {
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
    } catch (error) {
        console.log(error)
    }
}

const $readFile = (input) => {
    try {
        let file = input.files[0]
        let reader = new FileReader()
        $info({msg:`carregando...`,opt:`+n`})
        reader.readAsText(file)
        reader.onload = function () {avaliarDadoBruto({htmlRetornado:reader.result})}
        reader.onerror = function () {console.log(reader.error)}
    
    } catch (error) {
        console.log(error)
    }
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
            $info({msg:`Escala de`,opt:`+n`})
            $info({msg:`${dadoEscalasJson[0]["MÊS"]}/${dadoEscalasJson[0].DATA.split('/')[2]}, gerenciadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoEscalasJson.length)} cotas`, opt:'+'})
            conf.arquivo = `${dadoEscalasJson[0].DATA.split('/')[2]}-${dadoEscalasJson[0].DATA.split('/')[1]}-${dadoEscalasJson[0]["MÊS"]}`
            conf.mesAno = `${dadoEscalasJson[0]["MÊS"]}/${dadoEscalasJson[0].DATA.split('/')[2]}`
            funcaoAuxiliar = inicializarEscalas
        }
        if( tipoRetorno === 'Faltas' ){
            dadoBruto = dadoBruto.querySelector(".div_form_faltas")
            dadoBruto = dadoBruto.children[0].children[0]
            dadoEscalaJson = prepararFaltasJSon(dadoBruto)
            $info({msg:`Faltas de`,opt:`+n`})
            $info({msg:`${_extrairMesExtenso(dadoEscalaJson[0].DATA)}/${dadoEscalaJson[0].DATA.split('/')[2]}, retornadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoEscalaJson.length)} faltas`, opt:'+'})
            funcaoAuxiliar = inicializarFaltas
        }
        if( tipoRetorno === 'Inscritos'){
            dadoBruto = dadoBruto.querySelector(".tbResumo")
            dadoInscritosJson = prepararInscritosJSon(dadoBruto)
            // $info({msg:`Inscritos de`,opt:`+n`})
            // $info({msg:`${dadoEscalasJson[0]["MÊS"]}/${dadoEscalasJson[0].DATA.split('/')[2]}, retornados: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoInscritosJson.length)} inscritos`, opt:'+'})
            $info({msg:`${dadoInscritosJson[0].MES_REFERENCIA}, retornados: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoInscritosJson.length)} inscritos`, opt:'+n'})
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
    try {    
        let opr = {};
        let dadoEscalasJson = [];
        for (let i = 0; i < dadosHtml.childElementCount; i++){
            const tr = dadosHtml.children[i];
            const filhos = tr.childElementCount;
            if (filhos === 1) {
                const td = tr.children[0];
                if(td.colSpan === 7){
                    if(td.childElementCount === 1){
                        opr["desc_um"] = ''
                    }
                    for (let j = 0; j < td.childElementCount; j++){
                        const span = td.children[j];
                        opr[span.className] = span.innerHTML
                    }
                    const trM1 = dadosHtml.children[i+1];
                    const tdM1 = trM1.children[0];
                    if(tdM1.colSpan === 7){
                        for (let j = 0; j < tdM1.childElementCount; j++){
                            const span = tdM1.children[j];
                            opr[span.className] = span.innerHTML
                        }
                    }
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
                    obj['GBM_DESTINO'] = _extrairGbm({ quatro: opr.name_quatro, um: opr.desc_um, grupo: obj['GRUPO'], tres: opr.name_tres }),
                    obj['HORA'] = _extrairHorario(opr.name_quatro),
                    obj['LOCAL'] = '', //falta implementar
                    obj['MÊS'] = _extrairMesExtenso(opr.name_tres),
                    obj['QUINZENA'] = _extrairQuinzena(opr.name_tres),
                    obj['DATA'] = opr.name_tres, //DATA
                    obj['ASSINATURA'] = '',
                    obj['TEMPO'] = _extrairTempo({ data: obj['DATA'], hora: obj['HORA'] }),
                    obj['VALOR'] = _extrairValor(obj['TEMPO']),
                    obj['OPERAÇÃO'] = opr.name_dois, //OPERAÇÃO - TIPO
                    obj['FALTA'] = false
                    obj['name_um'] = opr.name_um, //OPERAÇÃO - GBM
                    obj['desc_um'] = opr.desc_um, //SUB_LOTAÇÃO_LOCAL
                    obj['name_dois'] = opr.name_dois, //OPERAÇÃO - TIPO
                    obj['name_tres'] = opr.name_tres, //DATA
                    obj['name_quatro'] = opr.name_quatro, //HORA - OPERAÇÃO - GBM
                    obj['name_cinco'] = opr.name_cinco, // CATEGORIA
                    dadoEscalasJson.push(obj);
                }
            }
            if (filhos !== 1 && filhos !== 7) {
                alert('Alteração no padrão de gerenciamento.');
                break;
            }
        }

        return dadoEscalasJson

    } catch (error) {
        $info({msg:`${error}`, opt:`+n`})
    }

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
        } else if (parametro.toUpperCase().indexOf("AEDES") > -1) {
            retorno = "DENGUE";
        } else {
            retorno = "EXTRAORDINÁRIO";
        }
        return retorno;
    }

    function _extrairGbm(parametro) {
        let retorno = parametro.quatro.split('-');
        let ano = parametro.tres.split("/");
        ano = ano[2];
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
        if (parametro.grupo == "DENGUE"){
            if (retorno == "ABMIL"){
                retorno = "GPCIV"
            }
        }
        
        //---Acertar Operação Verde Vivo 2023---------
        if (retorno.indexOf("VERDE VIVO") > -1) {
            if(ano == "2023"){
                retorno = parametro.um;
            }
            if(ano == "2024"){
                retorno = parametro.quatro.split("-");
                retorno = retorno[2].trim();
            }
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

    if(info.children[0].children[0].bgColor == "#DDD"){
        info = info.children[1]
        _versao2()
    } else {
        info = info.children[0]
        _versao1()
    }
    
    return dadoInscritosJson
    
    function _versao1(){
        let qtdColunasDias = info.children[0].children[8].colSpan
        for (i = 0; i < info.childElementCount; i++) {
            let obj = {}
            let tr = info.children[i]
            
            for (j = 0; j < tr.childElementCount; j++) {  // remover tag script para poder resgatar os cursos
                let tag = tr.children[j]
                if(tag.nodeName == "SCRIPT") {
                    tag.parentNode.removeChild(tag)
                    j = j - 1
                }
            }

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
    }

    function _versao2(){
        let mes_referencia = info.parentNode.parentNode.children[1].innerHTML
        for(i = 0; i < info.childElementCount; i++){ // trabalhando aqui 2024-04-16...
            let obj = {}
            let separar = null
            let tr = info.children[i]
            
            if(tr.children[0].nodeName === "TD") {
                separar = _sanitizar(tr.children[1].innerHTML).split("<br>")
                obj['SIAPE'] = separar[0],
                obj['POSTO_GRAD'] = separar[1],
                obj['QUADRO'] = separar[2],
                obj['NOME'] = `${_sanitizar(tr.children[2].innerHTML)}`,
                obj['LOTAÇÃO'] = `${_sanitizar(tr.children[3].innerHTML)}`,
                obj['ALA'] = `${_sanitizar(tr.children[4].innerHTML)}`,
                obj['MES_REFERENCIA'] = mes_referencia,
                obj['CURSOS'] = `${_sanitizar(tr.children[7].innerHTML)}`,
                dadoInscritosJson.push(obj)
            }
        }
    }
        
    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "")
        retorno = retorno.replace("&nbsp;", "").trim()
        return retorno
    }
}

function filtrarEscalasJson({ assinatura, data, escaladoPor, falta, grupo, gbm_destino, horario, lotacao, nome, operacao, operacao_tipo, quadro, quinzena, posto_grad, siape, sub_lotacao_local, tempo, cinco }) {
    
    let objAux = dadoEscalasJson.filter((e)=>{return e})

    if (assinatura !== undefined) {
        objAux = objAux.filter((e)=>{return e.ASSINATURA.indexOf(assinatura) > -1})
    }
    if (data !== undefined) {
        objAux = objAux.filter((e)=>{return data.includes(e.DATA)})
    }
    if (escaladoPor !== undefined) {
        if(escaladoPor === 'compulsória'){
            objAux = objAux.filter((e)=>{return e.ESCALADO.split('-').length === 3})
        }else if(escaladoPor === 'próprio'){
            objAux = objAux.filter((e)=>{return e.ESCALADO.split('-').length === 2})
        }else{
            objAux = objAux.filter((e)=>{return e.ESCALADO.indexOf(escaladoPor) > -1})
        }
    }
    if (falta !== undefined) {
        objAux = objAux.filter((e)=>{return e.FALTA === falta})
    }
    if (grupo !== undefined) {
        objAux = objAux.filter((e)=>{return e.GRUPO.indexOf(grupo) > -1})
    }
    if (gbm_destino !== undefined) {
        objAux = objAux.filter((e)=>{return e.GBM_DESTINO.indexOf(gbm_destino) > -1})
    }
    if (horario !== undefined) {
        objAux = objAux.filter((e)=>{return e.HORA.indexOf(horario) > -1})
    }
    if (lotacao !== undefined) {
        objAux = objAux.filter((e)=>{return e.LOTAÇÃO.indexOf(lotacao) > -1})
    }
    if (nome !== undefined) {
        objAux = objAux.filter((e)=>{return e.NOME.indexOf(nome) > -1})
    }
    if (operacao !== undefined) {
        if(operacao.length > 0){
            objAux = objAux.filter((e)=>{return operacao.includes(e.OPERAÇÃO)})
        }
        else{
            objAux = objAux.filter((e)=>{return e.OPERAÇÃO.indexOf(operacao) > -1})
        }
    }
    if (operacao_tipo !== undefined) {
        objAux = objAux.filter((e)=>{return e.name_um.indexOf(operacao_tipo) > -1})
    }
    if (quadro !== undefined) {
        objAux = objAux.filter((e)=>{return e.QUADRO.indexOf(quadro) > -1})
    }
    if (quinzena!==undefined) {
        objAux = objAux.filter((e)=>{return e.QUINZENA.indexOf(quinzena) > -1})
    }
    if (posto_grad!==undefined) {
        objAux = objAux.filter((e)=>{return e.POSTO_GRAD.indexOf(posto_grad) > -1})
    }
    if (sub_lotacao_local!==undefined) {
        objAux = objAux.filter((e)=>{return e.desc_um.indexOf(sub_lotacao_local) > -1})
    }
    if (siape!==undefined) {
        if(siape.substr(0,1) === '-'){
            siape = siape.substr(1,siape.length)
            objAux = objAux.filter((item) => {return item.SIAPE !== siape})
        }else{
            objAux = objAux.filter((e)=>{return e.SIAPE.indexOf(siape) > -1})
        }
    }
    if (tempo!==undefined) {
        tempo = tempo.toString()
        if (tempo.indexOf('12/24') > -1){
            objAux = objAux.filter((e)=>{return e.TEMPO=='12' || e.TEMPO == '24'})
        }else{
            objAux = objAux.filter((e)=>{return e.TEMPO.indexOf(tempo) > -1})
        }
    }
    if (cinco!==undefined) {
        objAux = objAux.filter((e)=>{return e.name_cinco.indexOf(cinco) > -1})
    }
        
    return objAux
}

function filtrarFaltasJson({ data, local, lotacao, nome, operacao, quadro, posto, siape, turno }) {
    let objAux = dadoEscalaJson.filter((e)=>{return e})

    if (data !== undefined) {
        objAux = objAux.filter((e) => { if ( e.DATA.indexOf(data) > -1 ) { return e }})
    }
    if (local!==undefined) {
        objAux = objAux.filter((e)=>{return local.includes(e.LOCAL)})
    }
    if (lotacao !== undefined) {
        objAux = objAux.filter((e) => { if ( e.LOTAÇÃO.indexOf(lotacao) > -1 ) { return e }})
    }
    if (nome !== undefined) {
        objAux = objAux.filter((e) => { if ( e.NOME.indexOf(nome) > -1 ) { return e }})
    }
    if (operacao!==undefined) {
        if(operacao.length > 0){
            objAux = objAux.filter((e)=>{return operacao.includes(e.OPERAÇÃO)})
        }
        else{
            objAux = objAux.filter((e)=>{return e.OPERAÇÃO.indexOf(operacao) > -1})
        }
    }
    if (quadro !== undefined) {
        objAux = objAux.filter((e) => { if ( e.QUADRO.indexOf(quadro) > -1 ) { return e }})
    }
    if (posto !== undefined) {
        objAux = objAux.filter((e) => { if ( e.POSTO.indexOf(posto) > -1 ) { return e }})
    }
    if (siape !== undefined) {
        objAux = objAux.filter((e) => { if ( e.SIAPE.indexOf(siape) > -1 ) { return e }})
    }
    if (turno !== undefined) {
        objAux = objAux.filter((e) => { if ( e.TURNO.indexOf(turno) > -1 ) { return e }})
    }

    return objAux
    
}

function filtrarInscritosJson({ cursos, lotacao, nome, quadro, posto_grad, siape }) {
    
    let objAux = dadoInscritosJson.filter((e)=>{return e})

    if (cursos !== undefined) {
        objAux = objAux.filter((e) => {return e.CURSOS.toLowerCase().indexOf(cursos.toLowerCase()) > -1})
        //objAux = objAux.filter((e) => {return e.CURSOS.indexOf(cursos) > -1})
    }
    if (lotacao !== undefined) {
        objAux = objAux.filter((e) => {return e.LOTAÇÃO.indexOf(lotacao) > -1})
    }
    if (nome !== undefined) {
        objAux = objAux.filter((e) => {return e.NOME.indexOf(nome) > -1})
    }
    if (quadro !== undefined) {
        objAux = objAux.filter((e) => {return e.QUADRO.indexOf(quadro) > -1})
    }
    if (posto_grad !== undefined) {
        objAux = objAux.filter((e) => {return e.POSTO_GRAD.indexOf(posto_grad) > -1})
    }
    if (siape !== undefined) { 
        objAux = objAux.filter((e) => {return e.SIAPE.indexOf(siape) > -1})
    }

    return objAux

}

function alterarDuracao(criteriosDeConsulta, dadosParaAlteracao) {
    try {
        const par = JSON.parse(criteriosDeConsulta)
        const objAux = filtrarEscalasJson(par)
        const arrAux = objAux.map((item) => { return item._ID })
        for (let i = 0; i < dadoEscalasJson.length; i++) {
            if (arrAux.includes(dadoEscalasJson[i]._ID)) {
                dadoEscalasJson[i].VALOR = dadosParaAlteracao.valor.toString()
                dadoEscalasJson[i].TEMPO = dadosParaAlteracao.tempo
            }
        }
        cmdExibirPlanilha.click()
    } catch (error) {
        $info({msg:error, opt:'+a'})
    }
}

function tratarFaltas() {
    if(dadoEscalasJson.length===0 || dadoEscalaJson.length===0){ return }
    
    if(dadoEscalasJson[0].DATA.split("/")[1] !== dadoEscalaJson[0].DATA.split("/")[1])
    {
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
    
    dadoEscalaJson.forEach((flt)=>{
        const filtroFalta = filtrarEscalasJson({siape:flt.SIAPE, data:flt.DATA, horario:flt.TURNO})
        if (filtroFalta.length == 0){
            // console.log("NotFound", flt.SIAPE, flt.DATA, flt.TURNO,flt.LOCAL, flt.OPERAÇÃO)
            $info({msg:`, Falta não atribuída: ${flt.SIAPE}, ${flt.DATA}, ${flt.TURNO}, ${flt.LOCAL}, ${flt.OPERAÇÃO}`, opt:`+a`})
        }
    })
}

function totais(campoDePesquisa, obj) {
    const res = obj.reduce((acc, item) => {
        if (!acc[item[campoDePesquisa]]) 
        {
            acc[item[campoDePesquisa]] = 1
        } else 
        {
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
    const arrAux = Object.keys(obj).sort(organizarGBM)
    if(tag.children[0].id !== ''){
        const sel = document.getElementById(tag.children[0].id)
        _limparSelect(sel)
        if(!sel.multiple){sel.append(new Option("(Há opções...)", ""))}
        arrAux.forEach((item)=>{
            sel.append(new Option(item, item ))
        })
    }
    else{
        const sel = document.createElement("select")
        sel.append(new Option("(Há opções...)", ""))
        arrAux.forEach((item)=>{
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
    
    if(radVoluntarioCom.checked)
    {
        preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({siape:'-SV', grupo:grupo})))
        return
    }
    
    if(radVoluntarioSem.checked)
    {
        preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({siape:'SV', grupo:grupo})))
        return
    }
    
    if(radCompulsorio.checked)
    {
        preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({escaladoPor:'compulsória', grupo:grupo})))
        return
    }
    
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({grupo:grupo})))

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
        $('divParametros').insertBefore(div, $('divParametros').children[0])
        $('btnEditarUpdate').addEventListener('click', (e)=>{
            fncEdicaoAlterarDados($('txtEditarIndex').value)
            $('btnEditarCancel').click()
        })
        $('btnEditarCancel').addEventListener('click', (e)=>{
            $(id.toString()).parentNode.removeChild($(id.toString()))
        })
    }})

    const timerDeAlteracao = setInterval(() => {
        if($('txtEditarId')){
            clearInterval(timerDeAlteracao)
            const id = parseInt(document.querySelector('.divDialogoEdicao').id)
            fncEdicaoCarregarDadosParaAlteracao(id)
        }
    }, 10)
}

function fncEdicaoCarregarDadosParaAlteracao(id){
    for(let i = 0; i < dadoEscalasJson.length; i++){
        if(dadoEscalasJson[i]._ID === id){
            $('txtEditarId').value = dadoEscalasJson[i]._ID
            $('txtEditarIndex').value = i
            $('txtEditarOperacao').value = dadoEscalasJson[i].OPERAÇÃO
            $('txtEditarDataHora').value = `${dadoEscalasJson[i].name_tres} - ${dadoEscalasJson[i].name_quatro}`
            $('txtEditarNome').value = `${dadoEscalasJson[i].POSTO_GRAD} ${dadoEscalasJson[i].QUADRO} ${dadoEscalasJson[i].NOME} - ${dadoEscalasJson[i].SIAPE}`
            $('txtEditarLotacao').value = dadoEscalasJson[i].LOTAÇÃO
            $('selEditarFalta').value = dadoEscalasJson[i].FALTA
            $('selEditarDuracao').value = dadoEscalasJson[i].TEMPO
            break
        }
    }
}

function fncEdicaoAlterarDados(index){
    if(dadoEscalasJson[parseInt(index)]._ID === parseInt($('txtEditarId').value)){
        dadoEscalasJson[parseInt(index)].FALTA = ($('selEditarFalta').value === 'true' ? true : false)
        dadoEscalasJson[parseInt(index)].TEMPO = $('selEditarDuracao').value.toString()
        dadoEscalasJson[parseInt(index)].VALOR = parseInt($('selEditarDuracao').value) * 50
        dadoEscalasJson[parseInt(index)].ASSINATURA = ($('selEditarFalta').value === 'true' ? `AUDITORIA` : ``)
        $info({msg:`Alterado apenas em memória`, opt:`+n`})
    }
}

const htmlConstruirEscala = (info) => {
    divResultado.innerHTML = ""; divBotaoAux.innerHTML = "";

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
        _incluirLinha(`<td colspan="7" class="nivel_um"><span class="name_um">${info.name_um}</span><span class="desc_um">${((info.desc_um === undefined || info.desc_um === '') ? '' : ' - ' + info.desc_um)}</span></td>`)
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
        _incluirLinha(`<td class="label_data">${info.POSTO_GRAD}</td><td class="label_data${((info.ESCALADO.indexOf('próprio') === -1 && info.ESCALADO !== '') ? ' escalaCompulsoria' : '')}" title="${info.ESCALADO}">${info.NOME}</td><td class="label_data" ondblclick = fncEditarCota(${info._ID})>${info.SIAPE}</td><td class="label_data">${info.LOTAÇÃO}</td><td class="label_data">${info.QUADRO}</td><td class="label_data">${info.ALA}</td><td class="label_data${(info.FALTA===true ? ' faltou' : '')}">${info.ASSINATURA}</td>`)
    }
    function _incluirLinha(stringHtml){
        const tr = document.createElement('tr')
        tr.innerHTML = stringHtml
        table.append(tr)
    }
}

const htmlConstruirTotalDeMilitaresEnvolvidos = (arrObj) => {
    divResultado.innerHTML = ""; divBotaoAux.innerHTML = "";

    const arrGrupo = arrObj.map((item) => `${item.GRUPO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)})
    for(let i = 0; i < arrGrupo.length; i++) {
        _criarTagGrupo(`GRUPO-${i}`, `${arrGrupo[i]}`)
        const objGbmDestino = arrObj.filter((item) => {if(item.GRUPO === arrGrupo[i]){return item}})
        const arrGbmDestino = objGbmDestino.map((item) => `${item.GBM_DESTINO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort(organizarGBM)

        for(let k = 0; k < arrGbmDestino.length; k++) {
            _criarTagGbmDestino(`GRUPO-${i}`, `GBM-${k}`, arrGbmDestino[k])
            _carregarSiape(i, arrGrupo, k, arrGbmDestino)
        }
    }
    
    _incluirBotaoOcultar()
    _incluirCabecalhoParaPdf()
    
    function _incluirBotaoOcultar(){
        const divBotaoAux = document.getElementById('divBotaoAux')
        const btn = document.createElement('button')
        btn.id = 'cmdOcultar'
        btn.innerHTML = 'Criar PDF'
        btn.addEventListener('click', (e)=>{
            e.preventDefault()
            if(confirm('Deseja alternar os totais de cotas entre oculto/visivel?')){
                const ctrs = document.querySelectorAll(".visivel")
                ctrs.forEach((ctr) => ctr.classList.toggle("invisivel"))
            }
            setTimeout(()=>{
                if(confirm(`Deseja baixar esses dados convertidos em um arquivo PDF?`)){
                    gerarPdf(divResultado)
                    document.getElementById('divBotaoAux').innerHTML=''
                }
            },500)
        })
        divBotaoAux.append(btn)
    }

    function _incluirCabecalhoParaPdf(){
        const tbResultado = document.getElementById('tbResultado')
        const thisH1 = document.createElement('h1')
        thisH1.innerHTML = `TOTAL DE MILITARES ENVOLVIDOS COM GSV<br>${arrObj[0].MÊS}/${arrObj[0].DATA.split("/")[2]}`
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
            divResultado.innerHTML = `` +
            `<table class="tabelaDeResultado" id="tbResultado"></table><br>`
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
        const arrTotalOficial = objOficial.map((item) => `${item.SIAPE}`).filter((elem, index, arr) => arr.indexOf(elem) === index);

        const tdGbmDestino = document.getElementById(`GRUPO-${codGrupo}-GBM-${codGbmDestino}`);
        tdGbmDestino.children[0].title = `${_tipsOperacoes(arrTips)}`;
        tdGbmDestino.children[1].innerHTML = `<span class=visivel>${arrTotalGeral.length}</span>`; //'' Total de Cotas
        tdGbmDestino.children[2].innerHTML = `${arrTotalOficial.length}`; //'' Total de Oficiais
        tdGbmDestino.children[3].innerHTML = `${arrTotalPraca.length}`; //'' Total de Praças
    }
}

const htmlConstruirTotalDeMilitaresEscalados = (arrObj) => {
    
    let par = parametroEscala()

    divResultado.innerHTML = ""; divBotaoAux.innerHTML = "";
    let contabilizar_total = 0
    const arrOperacao = arrObj.map((item) => `${item.OPERAÇÃO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
    const table = document.createElement('table')
    table.append(_parametros())
    table.append(_cabecalho1())
    table.append(_cabecalho2())
    for(let i = 0; i < arrOperacao.length; i++){
        par.operacao = arrOperacao[i]
        const objOperacao = filtrarEscalasJson(par)
        if (objOperacao.length > 0){
            table.append(_carregarTotais(objOperacao))
            contabilizar_total = contabilizar_total + ((objOperacao[0].TEMPO.indexOf(`24`) > -1) ? objOperacao.length * 2 : objOperacao.length)
        }
    }
    table.append(_rodape(contabilizar_total))
    divResultado.append(table)

    function _parametros(){
        const tr = document.createElement('tr')
        const par = JSON.stringify(parametroEscala())
        tr.innerHTML = `<th colspan="3">PARÂMETROS: ${(par == '{}'  ? '{"Nenhum filtro aplicado"}': par)}</th>`
        return tr
    }
    function _cabecalho1() {
        const tr = document.createElement('tr')
        tr.innerHTML = `<th colspan="3">RESUMO DA ESCALA - ${conf.mesAno.toUpperCase()}</th>`
        return tr
    }
    function _cabecalho2() {
        const tr = document.createElement('tr')
        tr.innerHTML = `<th>OPERAÇÃO</th>` +
            `<th>CARGA<br>HOR.</th>` +
            `<th>COTAS</th>`
        return tr
    }
    function _carregarTotais(obj) {
        let objCargaHoraria = {}
        for(let i = 0; i < obj.length; i++){
            objCargaHoraria[obj[i].TEMPO] = (isNaN(objCargaHoraria[obj[i].TEMPO]) ? 1 : parseInt(objCargaHoraria[obj[i].TEMPO] + 1))
        }
        let cargaHoraria = ''
        for(const key in objCargaHoraria){
            const elm = objCargaHoraria[key]
            // cargaHoraria = cargaHoraria + `${elm}` + (key===""?`(?h)`:`(${(key)}h)`)
            cargaHoraria = (key===""?`(?h)`:`${(key)}h`)
        }
        const tr = document.createElement('tr')
        const totalDeCotas = ((obj[0].TEMPO.indexOf(`24`) > -1) ? 
            `${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(obj.length) * 2} (${obj.length}x2)` : 
            `${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(obj.length)}`
        ) 
        tr.innerHTML = `<td style="text-align:left">${obj[0].OPERAÇÃO}</td>` + 
            `<td style="text-align:center">${cargaHoraria}</td>` + 
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
    const objTotaisDeFaltasPorDia = totais(par,dadoEscalaJson)
    const arrTotaisDeFaltasPorDia = Object.keys(totais(par,dadoEscalaJson)).sort()
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
    
    divResultado.innerHTML = ""; divBotaoAux.innerHTML = "";
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

const htmlConstruirTotalDeCotasPorData = (arrObj) => {
    const objTotaisDeCotasPorData = totais('DATA',arrObj)
    const arrTotaisDeCotasPorData = Object.keys(totais('DATA',arrObj)).sort()
    const table = document.createElement('table')
    const cabecalho = `<tr>` + 
                      `<td colspan="2" class="label_data_th">TOTAIS DE COTAS POR DATA</td>` + 
                      `</tr>` + 
                      `<tr>` + 
                      `<td class="label_data_th">DATA</td>` + 
                      `<td class="label_data_th">QTD.</td>` + 
                      `</tr>`
    let totalizar = 0
    
    table.innerHTML = cabecalho
    
    divResultado.innerHTML = ""; divBotaoAux.innerHTML = "";
    arrTotaisDeCotasPorData.forEach((elm)=>{
        const tr = document.createElement('tr')
        tr.innerHTML = `<td class="label_data">${elm}</td><td class="label_data">${objTotaisDeCotasPorData[elm]}</td>`
        table.append(tr)
        totalizar = totalizar + objTotaisDeCotasPorData[elm]
    })
    const resumo = `<td class="label_data_th">TOTAL GERAL</td><td class="label_data_th">${totalizar}</td>`
    const tr = document.createElement('tr')
    tr.innerHTML = resumo
    table.append(tr)
    divResultado.append(table)
}

const htmlConstruirTotaisPorDiasCotasOficiaisPraças = (arrObj) => {
    const arrOperacoes = Object.keys(totais('OPERAÇÃO', arrObj)).sort()
    const arrDatasNoMes = Object.keys(totais('DATA', arrObj)).sort()
    let dadoTemp = []
    let listaDeOperacoes = ''
    
    $info({ msg:`Quantidade de OPERAÇÔES retornadas: ${arrOperacoes.length}`, opt: '+n'})
    $info({ msg:`Quantidade de DIAS no mês retornadas: ${arrDatasNoMes.length}`, opt: '+n'})
    
    for(let i = 0; i < arrDatasNoMes.length; i++){
        const dataTemp = arrObj.filter((item, index) => {if(arrObj[index].DATA == arrDatasNoMes[i]) {return item}})
            const obj = {}
            let totalDePracas = 0
            let totalDeOficiais = 0
            let totalDeCotas = 0
            if(dataTemp.length>0){
                obj['DATA'] = arrDatasNoMes[i]
                for(let j = 0; j < dataTemp.length; j++){
                    if (dataTemp[j].CIRCULO == 'Oficial'){
                        totalDeOficiais = totalDeOficiais + 1
                    }
                    if (dataTemp[j].CIRCULO == 'Praça'){
                        totalDePracas = totalDePracas + 1
                    }
                    totalDeCotas = totalDeCotas + 1
                }
                obj['PRAÇAS'] = totalDePracas
                obj['OFICIAIS'] = totalDeOficiais
                obj['TOTAL'] = totalDeCotas
                dadoTemp.push(obj)
            }
    }

    divResultado.innerHTML = ""; divBotaoAux.innerHTML = "";
    const table = document.createElement('table')
    table.append(_cabecalho1())
    table.append(_cabecalho2())
    table.append(_cabecalho3())
    for(x = 0; x < dadoTemp.length; x++){
        table.append(_incluirDado(dadoTemp[x]))
    }
    divResultado.append(table)

    for(z = 0; z < arrOperacoes.length; z++){
        listaDeOperacoes += `${arrOperacoes[z]}<br>`
    }
    $('thMesReferenciaInscritos').innerHTML = listaDeOperacoes

    function _cabecalho1(){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_th" colspan="4" id="thMesReferenciaInscritos"></th>`
        return tr
    }
    function _cabecalho2(){
        const tr = document.createElement('tr')
        tr.innerHTML = `<th class="label_th" rowspan="2">DATA</th>` +
        `<th class="label_th" colspan="3">COTAS</th>`
        return tr
    }
    function _cabecalho3(){
        const tr = document.createElement('tr')
        tr.innerHTML = `` + 
        `<th class="label_th">OFICIAIS</th>` + 
        `<th class="label_th">PRAÇAS</th>` + 
        `<th class="label_th">TOTAL</th>`
        return tr
    }
    function _incluirDado(aux){
        const tr = document.createElement('tr')
        tr.innerHTML = `` + 
        `<td class="label_data">${aux.DATA}</td>` + 
        `<td class="label_data">${aux.OFICIAIS}</td>` + 
        `<td class="label_data">${aux.PRAÇAS}</td>` +
        `<td class="label_data">${aux.TOTAL}</td>`
        return tr
    }
}

const htmlConstruirTabelaInscritos = () => {
    divResultado.innerHTML = ""; divBotaoAux.innerHTML = "";
    const table = document.createElement('table')
    table.append(_cabecalho1())
    table.append(_cabecalho2())
    let indice = 0
    let mesDeReferencia = ''
    let cursos = txtCursos.value
    let total = 0

    for (let i = 0; i < arrOrdemPostoGrad.length; i++) {
        const objAux =  _ordenarDados(filtrarInscritosJson({ posto_grad: arrOrdemPostoGrad[i], cursos: cursos }))
        if(objAux.length > 0){
            for(j = 0; j < objAux.length; j++){
                if(mesDeReferencia === ''){ mesDeReferencia = objAux[j].MES_REFERENCIA }
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
        `<td class="label_data" style="text-align: left" title="${(aux.CURSOS==''? "(Nenhum)" : aux.CURSOS)}">${aux.NOME}</td>` + 
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
                if(elm === "FALTOU"){ td.className = "faltou" }
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

    let cotasTotal = arrObj.length
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
                if(obj[l].TEMPO === '24'){tdDia.style.backgroundColor = '#99f'} //cor da cota dupla
                if(obj[l].FALTA === true){tdDia.style.backgroundColor = '#faa'}
                tdDia.title = obj[l].OPERAÇÃO
                const tdOutroDia = tdDia.cloneNode(true)
                if (obj[l].TEMPO === '24'){
                    tr.append(tdOutroDia)
                    cotasTotal = cotasTotal + 1
                }
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

function organizarGBM(a,b) {
    let n1, n2
    const x = a.split(" ")
    const y = b.split(" ")

    if(x.length > 1 && y.length > 1)
    {
        if(x[0].indexOf("º")>-1 && y[0].indexOf("º")>-1)
        {
            n1 = parseInt(x[0].substr(0, x.length))
            n2 = parseInt(y[0].substr(0, x.length))
        }
        if(x[1].indexOf("º")>-1 && y[1].indexOf("º")>-1)
        {
            n1 = parseInt(x[1].substr(0, x.length))
            n2 = parseInt(y[1].substr(0, x.length))
        }
    }
    
    if(n1 === undefined || n2 === undefined)
    {
        let i = 0
        do
        {
            n1 = a.charCodeAt(i)
            n2 = b.charCodeAt(i)
            i++
        }
        while (n1 === n2)
    }

    if(n1 < n2)
    {
        return -1
    }
    else if(n1 > n2)
    {
        return 1
    }
    else
    {
        return 0
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
    