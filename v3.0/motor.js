const arrOrdemPostoGrad = ['CEL', 'TC', 'MAJ', 'CAP', '1 TEN', '2 TEN', 'ASP', 'ST', '1 SGT', '2 SGT', '3 SGT', 'CB', 'SD/1', 'SD/2']
const $ = tag => document.getElementById(tag);

let dadoEscalasJson = [];
let dadoFaltasJson = [];
let dadoInscritosJson = [];
let conf = [];

window.onload = function(){
    document.addEventListener('keyup',(k)=>{
        if (k.key == "Escape"){
            const div = document.getElementsByClassName('divDialogoEdicao');
            if(div.length > 0){
                div[0].parentElement.removeChild(div[0]);
            }
        }
    })
    //opções
    $('fileArquivo').addEventListener('change', (e)=>{
        e.preventDefault();
        if($('fileArquivo').files.length > 0){
            $readFile($('fileArquivo'));
        }
    })
    //opções
    $('btnOpcaoTodas').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.cota(e.target);
    })
    $('btnOpcaoComVoluntario').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.cota(e.target);
    })
    $('btnOpcaoSemVoluntario').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.cota(e.target);
    })
    $('btnOpcaoCompulsorio').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.cota(e.target);
    })
    //quinzena
    $('btnQuinzenaMesInteiro').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.quinzena(e.target);
    })
    $('btnQuinzena1').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.quinzena(e.target);
    })
    $('btnQuinzena2').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.quinzena(e.target);
    })
    //falta
    $('btnFaltaTodas').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.falta(e.target);
    })
    $('btnFaltaFalse').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.falta(e.target);
    })
    $('btnFaltaTrue').addEventListener('click', (e)=>{
        e.preventDefault();
        opcoes.falta(e.target);
    })
    //PesquisaPorSiape
    $('txtCotasPorSiape').addEventListener('keyup',(e)=>{
        if(e.key == 'Enter'){
            const objAux = filtrarEscalasJson({siape: $('txtCotasPorSiape').value});
            if(objAux.length==0){
                alert(`Não foram encontradas cotas para o SIAPE informado: ${$('txtCotasPorSiape').value}`);
                return false;
            }
            html.escalasParaBg(objAux);
        }
        // console.log(e.key);
    })
}
const $readFile = (input) => {
    let carregado = false;
    for (let i = 0; i < input.files.length; i++) {
        if (input.files[i].name.toLowerCase().indexOf('escala') > -1){
            $led(10);
            const file = input.files[i];
            // conf.dataHoraEscala = Date(file.lastModified);
            carregarArquivo(file);
            carregado = true
        }
        if (input.files[i].name.toLowerCase().indexOf('falta') > -1){
            $led(20);
            const file = input.files[i];
            // conf.dataHoraFalta = Date(file.lastModified);
            carregarArquivo(file);
            carregado = true
        }
        if (input.files[i].name.toLowerCase().indexOf('inscrito') > -1){
            $led(30);
            const file = input.files[i];
            // conf.dataHoraInscrito = Date(file.lastModified);
            carregarArquivo(file);
            carregado = true
        }
    }

    if(carregado == false){
        alert('O nome do arquivo não informa a forma como os dados devem ser processados!');
    }
    // input.title = `Escala: ${(conf.dataHoraEscala == undefined ? "" : conf.dataHoraEscala)}\nFalta: ${(conf.dataHoraFalta == undefined ? "" : conf.dataHoraFalta)}\nInscrito: ${(conf.dataHoraInscrito == undefined ? "" : conf.dataHoraInscrito)}`;

    function carregarArquivo(file){
        try {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function () { avaliarDadoBruto({htmlRetornado:reader.result}) }
            reader.onerror = function () { console.log(reader.error) }
        } catch (error) {
            console.log(error);
        }
    }
}
function avaliarDadoBruto({htmlRetornado}) {
    try {
        if(htmlRetornado === null){return}
        
        const parser = new DOMParser();
        let dadoBruto = parser.parseFromString(htmlRetornado, 'text/html');
        let funcaoAuxiliar = false;
        
        const tipoRetorno = _testarArquivoDeOrigem(dadoBruto)
        if( tipoRetorno === false ){return}
        if( tipoRetorno === 'Escalas' ){
            dadoBruto = dadoBruto.querySelector(".table_relatorio")
            dadoBruto = dadoBruto.children[0]
            dadoEscalasJson = prepararEscalasJSon(dadoBruto)
            conf.arquivo = `${dadoEscalasJson[0].DATA.split('/')[2]}-${dadoEscalasJson[0].DATA.split('/')[1]}-${dadoEscalasJson[0]["MÊS"]}`
            conf.mesAno = `${dadoEscalasJson[0]["MÊS"]}/${dadoEscalasJson[0].DATA.split('/')[2]}`
            funcaoAuxiliar = inicializarInterfaceDeEscalas
        }
        if( tipoRetorno === 'Faltas' ){
            dadoBruto = dadoBruto.querySelector(".div_form_faltas");
            dadoBruto = dadoBruto.children[0].children[0];
            dadoFaltasJson = prepararFaltasJSon(dadoBruto);
            funcaoAuxiliar = inicializarInterfaceDeFaltas;
        }
        if( tipoRetorno === 'Inscritos'){
            dadoBruto = dadoBruto.querySelector(".tbResumo")
            dadoInscritosJson = prepararInscritosJSon(dadoBruto)
            funcaoAuxiliar = inicializarInterfaceDeInscritos
        }
        if(funcaoAuxiliar){funcaoAuxiliar()}

        function _testarArquivoDeOrigem(dadoBruto){
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
        let objEscala = [];
        let idx = 1;
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
                    const objTmp = {};idx++;
                    objTmp['_ID'] = idx; 
                    objTmp['POSTO_GRAD'] = `${_sanitizar(tr.children[0].innerHTML)}`; 
                    objTmp['NOME'] = `${_sanitizar(tr.children[1].innerHTML)}`; 
                    objTmp['ESCALADO'] = `${_sanitizar(tr.children[1].title)}`; 
                    objTmp['SIAPE'] = `${_sanitizar(tr.children[2].innerHTML)}`; 
                    objTmp['LOTAÇÃO'] = `${_sanitizar(tr.children[3].innerHTML)}`; 
                    objTmp['QUADRO'] = `${_sanitizar(tr.children[4].innerHTML)}`; 
                    objTmp['CIRCULO'] = `${_extrairCirculo(tr.children[4].innerHTML)}`; 
                    objTmp['ALA'] = `${_sanitizar(tr.children[5].innerHTML)}`; 
                    objTmp['GRUPO'] = _classificarGrupo(opr.name_dois); 
                    objTmp['GBM_DESTINO'] = _extrairGbm({ quatro: opr.name_quatro, um: opr.desc_um, grupo: objTmp['GRUPO'], tres: opr.name_tres });
                    objTmp['HORA'] = _extrairHorario(opr.name_quatro);
                    objTmp['LOCAL'] = _extrairLocal(opr.name_quatro);
                    objTmp['MÊS'] = _extrairMesExtenso(opr.name_tres);
                    objTmp['QUINZENA'] = _extrairQuinzena(opr.name_tres);
                    objTmp['DATA'] = opr.name_tres; //DATA
                    objTmp['ASSINATURA'] = '';
                    objTmp['TEMPO'] = _extrairTempo({ data: objTmp['DATA'], hora: objTmp['HORA'] });
                    objTmp['VALOR'] = _extrairValor(objTmp['TEMPO']);
                    objTmp['OPERAÇÃO'] = opr.name_dois; //OPERAÇÃO - TIPO
                    objTmp['FALTA'] = false; 
                    objTmp['name_um'] = opr.name_um; //OPERAÇÃO - GBM
                    objTmp['desc_um'] = opr.desc_um; //SUB_LOTAÇÃO_LOCAL
                    objTmp['name_dois'] = opr.name_dois; //OPERAÇÃO - TIPO
                    objTmp['name_tres'] = opr.name_tres; //DATA
                    objTmp['name_quatro'] = opr.name_quatro; //HORA - OPERAÇÃO - GBM
                    objTmp['name_cinco'] = opr.name_cinco; // CATEGORIA
                    if(objTmp['TEMPO'] == '24'){
                        objTmp['TEMPO'] = '12';
                        objTmp['VALOR'] = '600';
                        objTmp['HORA'] = '08h00 às 20h00'
                        objEscala.push(objTmp);
                        const clone = JSON.parse(JSON.stringify(objTmp));idx++;
                        clone['_ID'] = idx;
                        clone['HORA'] = '20h00 às 08h00'
                        objEscala.push(clone);
                    }else{
                        objEscala.push(objTmp);
                    }
                }
            }
            if (filhos !== 1 && filhos !== 7) {
                alert('Alteração no padrão de gerenciamento.');
                break;
            }
        }
        $led(12);
        return objEscala

    } catch (error) {
        $led(11);
        console.log(error)
    }

    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "");
        retorno = retorno.replace("&nbsp;", "").trim();
        return retorno;
    }
    function _classificarGrupo(parametro) {
        let retorno = '';
        retorno = _sanitizar(parametro);

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
    function _extrairCirculo(parametro) {
        let retorno = '';
        aux = _sanitizar(parametro);
        if (aux.indexOf("QBMG") > -1) {
            retorno = "Praça";
        }
        if (aux.indexOf("QOBM") > -1) {
            retorno = "Oficial";
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
        retorno = retorno[0].replace(" À ", " Às ").replace(" à ", " às ").trim();
        return retorno.toLowerCase();
    }
    function _extrairLocal(parametro){
        let retorno = parametro.split('-');
        if(retorno[retorno.length - 1] != undefined){
            retorno = retorno[retorno.length - 1].trim();
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
            retorno = `${('00'+parseInt(auxTempo)).slice(-2)}`;
            //`${('00'+parseInt('0'+item.TEMPO)).slice(-2)} horas`
        }
        else{
            retorno = '-';
        }
        return retorno
    }
    function _extrairValor(parametro) {
        return (parametro * 50).toString()
    }
}
function prepararFaltasJSon(dadosHtml){
    let objFalta=[]
    for (i = 0; i < dadosHtml.childElementCount; i++) {
        const objTmp = {}
        const tr = dadosHtml.children[i]
        if (tr.children[0].nodeName === "TD") {
            objTmp['OPERAÇÃO'] = `${_sanitizar(tr.children[0].innerHTML)}`
            objTmp['LOCAL'] = `${_sanitizar(tr.children[1].innerHTML)}`
            objTmp['DATA'] = `${_sanitizar(tr.children[2].innerHTML)}`
            objTmp['TURNO'] = `${_sanitizar(tr.children[3].innerHTML).toLowerCase()}`
            objTmp['GRUPO'] = `${_sanitizar(tr.children[4].innerHTML)}`
            objTmp['POSTO'] = `${_sanitizar(tr.children[5].innerHTML)}`
            objTmp['NOME'] = `${_sanitizar(tr.children[6].innerHTML)}`
            objTmp['SIAPE'] = `${_sanitizar(tr.children[7].innerHTML)}`
            objTmp['LOTAÇÃO'] = `${_sanitizar(tr.children[8].innerHTML)}`
            objTmp['QUADRO'] = `${_sanitizar(tr.children[9].innerHTML)}`
            objTmp['ALA'] = `${_sanitizar(tr.children[10].innerHTML)}`
            objTmp['FALTA'] = `${_sanitizar(tr.children[11].innerHTML)}`
            if(objTmp['TURNO'] == '08h00 às 08h00'){
                objTmp['TURNO'] = '08h00 às 20h00';
                objFalta.push(objTmp);
                const clone = JSON.parse(JSON.stringify(objTmp));
                clone['TURNO'] = '20h00 às 08h00'
                objFalta.push(clone);
            }else{
                objFalta.push(objTmp);
            }
        }
    }

    $led(22)
    return objFalta
        
    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "");
        retorno = retorno.replace("&nbsp;", "").trim();
        retorno = retorno.replace(" À ", " ÀS ").replace(" à ", " às ");
        return retorno
    }
}
function prepararInscritosJSon(dadoHtml){
    let objTmp = []

    if(dadoHtml.children[0].children[0].bgColor == "#DDD"){
        dadoHtml = dadoHtml.children[1]
        _versao2()
    } else {
        dadoHtml = dadoHtml.children[0]
        _versao1()
    }
    
    $led(32);
    return objTmp
    
    function _versao1(){
        let qtdColunasDias = dadoHtml.children[0].children[8].colSpan
        for (i = 0; i < dadoHtml.childElementCount; i++) {
            let obj = {}
            let tr = dadoHtml.children[i]
            
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
                objTmp.push(obj)
            }
        }
    }
    
    function _versao2(){
        let mes_referencia = dadoHtml.parentNode.parentNode.children[1].innerHTML
        for(i = 0; i < dadoHtml.childElementCount; i++){
            let obj = {}
            let separar = null
            let tr = dadoHtml.children[i]

            if(tr.children[0].nodeName === "TD") {
                separar = _sanitizar(tr.children[1].innerHTML).split("<br>")
                if(separar.length > 1) {
                    obj['SIAPE'] = separar[0];
                    obj['POSTO_GRAD'] = separar[1];
                    obj['QUADRO'] = separar[2];
                    obj['NOME'] = `${_sanitizar(tr.children[2].innerHTML)}`;
                    obj['LOTAÇÃO'] = `${_sanitizar(tr.children[3].innerHTML)}`;
                    obj['ALA'] = `${_sanitizar(tr.children[4].innerHTML)}`;
                    obj['MES_REFERENCIA'] = mes_referencia;
                    obj['CURSOS'] = `${_sanitizar(tr.children[7].innerHTML)}`;
                } else {
                    obj['SIAPE'] = `${_sanitizar(tr.children[1].innerHTML)}`;
                    obj['POSTO_GRAD'] = `${_sanitizar(tr.children[2].innerHTML)}`;
                    obj['QUADRO'] = `${_sanitizar(tr.children[3].innerHTML)}`;
                    obj['NOME'] = `${_sanitizar(tr.children[4].innerHTML)}`;
                    obj['LOTAÇÃO'] = `${_sanitizar(tr.children[5].innerHTML)}`;
                    obj['ALA'] = `${_sanitizar(tr.children[6].innerHTML)}`;
                    obj['MES_REFERENCIA'] = mes_referencia;
                    obj['CURSOS'] = `${_sanitizar(tr.children[9].innerHTML)}`;
                }
                objTmp.push(obj)
            }
        }
    }
        
    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "")
        retorno = retorno.replace("&nbsp;", "").trim()
        return retorno
    }
}

//Interface
function inicializarInterfaceDeEscalas(){
    dados.carregarControles();
}
function inicializarInterfaceDeFaltas(){
    if(dadoEscalasJson.length==0){
        setTimeout(() => {
            inicializarInterfaceDeFaltas();
        }, 200);
        console.log('Os dados de escala não foram carregados completamente...');
        return;
    }
    else{
        setTimeout(() => {
            tratarFaltas();
        }, 200);
    }
}
function inicializarInterfaceDeInscritos(){
    // console.debug('Não implementado a interface de Inscritos:', 'inicializarInterfaceDeInscritos()');
}

const opcoes = {
    cota:function(ctrAux){
        if(ctrAux.id == 'btnOpcaoTodas'){
            $('btnOpcaoTodas').ariaPressed = 'true';
            $('btnOpcaoComVoluntario').ariaPressed = 'false';
            $('btnOpcaoSemVoluntario').ariaPressed = 'false';
            $('btnOpcaoCompulsorio').ariaPressed = 'false';
        }
        if(ctrAux.id == 'btnOpcaoComVoluntario'){
            $('btnOpcaoTodas').ariaPressed = 'false';
            $('btnOpcaoComVoluntario').ariaPressed = 'true';
            $('btnOpcaoSemVoluntario').ariaPressed = 'false';
            $('btnOpcaoCompulsorio').ariaPressed = 'false';
        }
        if(ctrAux.id == 'btnOpcaoSemVoluntario'){
            $('btnOpcaoTodas').ariaPressed = 'false';
            $('btnOpcaoComVoluntario').ariaPressed = 'false';
            $('btnOpcaoSemVoluntario').ariaPressed = 'true';
            $('btnOpcaoCompulsorio').ariaPressed = 'false';
        }
        if(ctrAux.id == 'btnOpcaoCompulsorio'){
            $('btnOpcaoTodas').ariaPressed = 'false';
            $('btnOpcaoComVoluntario').ariaPressed = 'false';
            $('btnOpcaoSemVoluntario').ariaPressed = 'false';
            $('btnOpcaoCompulsorio').ariaPressed = 'true';
        }
        opcoes._acao();
    },
    falta: function(ctrAux){
        if(ctrAux.id == 'btnFaltaTodas'){
            $('btnFaltaTodas').ariaPressed = 'true';
            $('btnFaltaFalse').ariaPressed = 'false';
            $('btnFaltaTrue').ariaPressed = 'false';
        }
        if(ctrAux.id == 'btnFaltaFalse'){
            $('btnFaltaTodas').ariaPressed = 'false';
            $('btnFaltaFalse').ariaPressed = 'true';
            $('btnFaltaTrue').ariaPressed = 'false';
        }
        if(ctrAux.id == 'btnFaltaTrue'){
            $('btnFaltaTodas').ariaPressed = 'false';
            $('btnFaltaFalse').ariaPressed = 'false';
            $('btnFaltaTrue').ariaPressed = 'true';
        }
        opcoes._acao();
    },
    quinzena: function(ctrAux){
        if(ctrAux.id == 'btnQuinzenaMesInteiro'){
            $('btnQuinzenaMesInteiro').ariaPressed = 'true';
            $('btnQuinzena1').ariaPressed = 'false';
            $('btnQuinzena2').ariaPressed = 'false';
        }
        if(ctrAux.id == 'btnQuinzena1'){
            $('btnQuinzenaMesInteiro').ariaPressed = 'false';
            $('btnQuinzena1').ariaPressed = 'true';
            $('btnQuinzena2').ariaPressed = 'false';
        }
        if(ctrAux.id == 'btnQuinzena2'){
            $('btnQuinzenaMesInteiro').ariaPressed = 'false';
            $('btnQuinzena1').ariaPressed = 'false';
            $('btnQuinzena2').ariaPressed = 'true';
        }
        opcoes._acao();
    },
    _acao:function(){
        const objAux = filtrarEscalasJson(_parametros());
        filtrar.prepararDados(objAux);
    }
}

const dados = {
    carregarControles:function(){
        limparTudo();
        
        dados.carregarGrupo();
        dados.carregarDuracao();
        dados.carregarOperacao();
        dados.carregarGbmDestino();
        dados.carregarTurno();
        dados.carregarQuadro();
        dados.carregarDataDoMes();
        $('divTotais').innerHTML = `Cotas Mês: ${dadoEscalasJson.length.toLocaleString('pt-BR')}<br>Filtradas: ${filtrarEscalasJson(_parametros()).length.toLocaleString('pt-BR')}`
        
        setTimeout(() => {
            filtrar.prepararDados(filtrarEscalasJson(_parametros()));
        }, 500);
    },
    carregarDataDoMes:function(){
        dados._criarCalendarioDoMes();
    },
    carregarGrupo: function(){
        const arrGrupo = dadoEscalasJson.map((item)=>`${item.GRUPO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divGrupo = $('divFiltroGrupo');
        dados._limparLista(divGrupo);
        for(let i = 0; i < arrGrupo.length; i++){
            divGrupo.append(dados._criarItemDaLista(divGrupo, arrGrupo[i]));
        }
        $('fldGrupo').children[0].innerHTML = `Grupos: (${arrGrupo.length})`;
    },
    carregarDuracao: function(){
        const arrDuracao = dadoEscalasJson.map((item)=>`${item.TEMPO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divDuracao = $('divFiltroDuracao');
        $('fldDuracao').children[0].innerHTML = `Duração: (${arrDuracao.length})`;
        dados._limparLista(divDuracao);
        for(let i = 0; i < arrDuracao.length; i++){
            divDuracao.append(dados._criarItemDaLista(divDuracao, arrDuracao[i]));
        }
    },
    carregarOperacao: function(){
        const arrOperacao = dadoEscalasJson.map((item)=>`${item.OPERAÇÃO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divOperacao = $('divFiltroOperacao');
        dados._limparLista(divOperacao);
        for(let i = 0; i < arrOperacao.length; i++){
            divOperacao.append(dados._criarItemDaLista(divOperacao, arrOperacao[i]));
        }
        $('fldOperacao').children[0].innerHTML = `Operações: (${arrOperacao.length})`;
    },
    carregarGbmDestino: function(){
        const arrGbmDestino = dadoEscalasJson.map((item)=>`${item.GBM_DESTINO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        let arrAux = arrGbmDestino;
        const divGbmDestino = $('divFiltroGbmDestino');
        dados._limparLista(divGbmDestino);
        for(let i = 0; i < arrGbmDestino.length; i++){
            arrAux = arrAux.sort(ordenarPorGBM);
            divGbmDestino.append(dados._criarItemDaLista(divGbmDestino, arrAux[i]));
        }
        $('fldGbmDestino').children[0].innerHTML = `Destino: (${arrGbmDestino.length})`;
    },
    carregarTurno: function(){
        const arrTurno = dadoEscalasJson.map((item)=>`${item.HORA}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divTurno = $('divFiltroTurno');
        dados._limparLista(divTurno);
        for(let i = 0; i < arrTurno.length; i++){
            divTurno.append(dados._criarItemDaLista(divTurno, arrTurno[i]));
        }
        $('fldTurno').children[0].innerHTML = `Turnos: (${arrTurno.length})`;
    },
    carregarQuadro: function(){
        const arrQuadro = dadoEscalasJson.map((item)=>`${item.QUADRO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divQuadro = $('divFiltroQuadro');
        dados._limparLista(divQuadro);
        for(let i = 0; i < arrQuadro.length; i++){
            divQuadro.append(dados._criarItemDaLista(divQuadro, arrQuadro[i]));
        }
        $('fldQuadro').children[0].innerHTML = `Quadros: (${arrQuadro.length})`;
    },
    _criarItemDaLista:function(objTag, strTexto){
        const btnTemp = document.createElement('button');
        btnTemp.id = objTag.id+'Btn';
        btnTemp.ariaLabel = `${strTexto}`;
        btnTemp.ariaPressed = 'false';
        btnTemp.className = 'campoCriterio';
        btnTemp.innerHTML = `${strTexto}`;
        btnTemp.addEventListener('click', (e)=>{
            if(btnTemp.ariaPressed=="true"){btnTemp.ariaPressed="false"}else{btnTemp.ariaPressed="true"}
            filtrar.processarClickDoBotao(btnTemp);
            html.atualizacaoAutomatica();
        })
        return btnTemp
    },
    _criarCalendarioDoMes:function(){
        const arrDias = dadoEscalasJson[0].DATA;
        const ano = parseInt(arrDias.split('/')[2]);
        const mes = parseInt(arrDias.split('/')[1]);
        $('fldCalendario').children[0].innerHTML = `Calendário: (${conf.mesAno})`;

        let dataInicio = new Date(`${ano.toString()}-${("00"+mes.toString()).slice(-2)}-01T00:00:00`);
        let dataAux = new Date(dataInicio);
        let dataTermino = new Date(dataAux.setMonth(dataAux.getMonth()+1));
        dataTermino = new Date(dataAux.setDate(dataAux.getDate()-1));
        dataAux = new Date(dataInicio);
        _excluirBotoesDia();
        while(dataAux <= dataTermino){
            if( dataAux.getDate() == 1){
                for(let i = 0; i < 7; i++){
                    if(i < dataAux.getDay()){
                        $('divCalendario').appendChild(_criarBtnDia());
                    }else{break}
                }
            }
            $('divCalendario').appendChild(_criarBtnDia(dataAux));
            dataAux = new Date(dataAux.setDate(dataAux.getDate()+1));
        }
        function _criarBtnDia(diaAux){
            const btnTemp = document.createElement('button');
            btnTemp.id = 'btnDiaDoMes'+(diaAux == undefined ? '-' : ("00"+diaAux.getDate()).slice(-2));
            btnTemp.ariaLabel = (diaAux!=undefined?diaAux.toLocaleDateString():'');
            btnTemp.ariaPressed = 'false';
            btnTemp.ariaDisabled = 'false'
            btnTemp.className = (diaAux==undefined ? `diaMes` : ((([0,6]).includes(new Date(diaAux).getDay())) ? `diaMes diaMesFinalDeSemana` : `diaMes`));
            btnTemp.innerHTML = (diaAux==undefined ? '-':("00"+diaAux.getDate()).slice(-2));
            btnTemp.addEventListener('click', (e)=>{
                if(btnTemp.ariaPressed=="true"){btnTemp.ariaPressed="false"}else{btnTemp.ariaPressed="true"}
                filtrar.processarClickDoBotao(btnTemp);
                html.atualizacaoAutomatica();
            })
            return btnTemp
        }
        function _excluirBotoesDia(){
            divCalendario = $('divCalendario');
            for(let i = divCalendario.childElementCount-1; i > 0; i--){
                if(divCalendario.children[i].nodeName.toLowerCase() == 'button'){
                    divCalendario.removeChild(divCalendario.children[i]);
                }
            }
        }
    },
    _limparLista:function(ctrAux){
        for(let i = ctrAux.childElementCount-1; i >= 0; i--){
            if(ctrAux.children[i].nodeName.toLowerCase() == 'button'){
                ctrAux.removeChild(ctrAux.children[i]);
            }
        }
    }
}

const filtrar = {
    processarClickDoBotao:function(botao){
        if ( botao.id.indexOf('btnDiaDoMes') > -1 ) {
            const objAux = filtrarEscalasJson(_parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroDuracaoBtn' ) {
            const objAux = filtrarEscalasJson(_parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroGbmDestinoBtn' ) {
            const objAux = filtrarEscalasJson(_parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroGrupoBtn' ) {
            const objAux = filtrarEscalasJson(_parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroOperacaoBtn' ) {
            const objAux = filtrarEscalasJson(_parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id.indexOf('divFiltroQuadroBtn') > -1 ) {
            const objAux = filtrarEscalasJson(_parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroTurnoBtn' ) {
            const objAux = filtrarEscalasJson(_parametros());
            filtrar.prepararDados(objAux);
        }
    },
    prepararDados:function(objAux){
        filtrar.destacarDuracao(objAux);
        filtrar.destacarGrupo(objAux);
        filtrar.destacarOperacao(objAux);
        filtrar.destacarGbmDestino(objAux);
        filtrar.destacarTurno(objAux);
        filtrar.destacarQuadro(objAux);
        filtrar.destacarDatas(objAux);
        $('divTotais').innerHTML = `Total Mês: ${dadoEscalasJson.length.toLocaleString('pt-BR')}<br>Filtrado: ${objAux.length.toLocaleString('pt-BR')}`;
    },
    destacarDuracao:function(objAux){
        const arrDuracao = objAux.map((item)=>`${item.TEMPO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        filtrar.destacar(arrDuracao, $('divFiltroDuracao'));
        $('fldDuracao').children[0].innerHTML = `Duração: (${arrDuracao.length})`;
    },
    destacarGrupo:function(objAux){
        const arrGrupo = objAux.map((item)=>`${item.GRUPO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        filtrar.destacar(arrGrupo, $('divFiltroGrupo'));
        $('fldGrupo').children[0].innerHTML = `Grupos: (${arrGrupo.length})`;
    },
    destacarOperacao:function(objAux){
        const arrOperacao = objAux.map((item)=>`${item.OPERAÇÃO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        filtrar.destacar(arrOperacao, $('divFiltroOperacao'));
        $('fldOperacao').children[0].innerHTML = `Operações: (${arrOperacao.length})`;
    },
    destacarGbmDestino:function(objAux){
        const arrGbmDestino = objAux.map((item)=>`${item.GBM_DESTINO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        filtrar.destacar(arrGbmDestino, $('divFiltroGbmDestino'));
        $('fldGbmDestino').children[0].innerHTML = `Destino: (${arrGbmDestino.length})`;
    },
    destacarTurno:function(objAux){
        const arrTurno = objAux.map((item)=>`${item.HORA}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        filtrar.destacar(arrTurno, $('divFiltroTurno'));
        $('fldTurno').children[0].innerHTML = `Turnos: (${arrTurno.length})`;
    },
    destacarQuadro:function(objAux){
        const arrQuadro = objAux.map((item)=>`${item.QUADRO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        filtrar.destacar(arrQuadro, $('divFiltroQuadro'));
        $('fldQuadro').children[0].innerHTML = `Quadros: (${arrQuadro.length})`;
    },
    destacarDatas:function(objAux){
        const arrDatas = objAux.map((item)=>`${item.DATA}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        filtrar.destacar(arrDatas, $('divCalendario'));
    },
    destacar:function(arrAux, ctrAux){
        const divAux = ctrAux;
        for(let i = 0; i < divAux.childElementCount; i++){
            const ctr = divAux.children[i];
            if(ctr.ariaLabel){
                const contagem = arrAux.filter((e)=>{return e == ctr.ariaLabel});
                ctr.ariaDisabled = 'true';
                if(contagem.length > 0){
                    ctr.ariaDisabled = 'false';
                }
            }
        }
    }
}

const html = {
    processarMenuExibirResultado:function(opcao){
        const objAux = filtrarEscalasJson( _parametros() );
        if(![21].includes(opcao)){
            if(objAux.length == 0){
                alert('Não há dados a serem exibidos!');
                return 0;
            }
        }
        const strFiltro = JSON.stringify( _parametros() );
        // $('divAuxiliar').innerHTML = strFiltro == `{}` ? `{Nenhum Filtro Aplicado!}` :  strFiltro;
        $('divAuxiliar').style.color='yellow';
        setTimeout(() => {
            $('divAuxiliar').style.color='gray';
        }, 2000);
        switch (opcao) {
            case 1:
                html.escalasParaBg(objAux);
                break;
            case 2:
                html.exibirListaDeVoluntariosEscalados(objAux);
                break;
            case 3:
                html.construirGrade(dadoFaltasJson);
                break;
            case 4:
                html.exibirPercentualDeFaltas(objAux);
                break;
            case 20:
                html.totalDeMilitaresEnvolvidos(objAux);
                break;
            case 21:
                html.construirTabelaInscritos();
                break;
            case 22:
                html.construirPlanilha(objAux);
                break;
            case 23:
                html.exibirCotaDobrada();
                break;
            case 24:
                html.criarArquivoExcel();
                break;
            case 30:
                html.totalDeCotasEscaladas(objAux);
                break;
            case 31:
                html.exibirTotais('GRUPO', objAux);
                break;
            case 32:
                html.exibirTotais('OPERAÇÃO', objAux);
                break;
            case 33:
                html.exibirTotais('GBM_DESTINO', objAux);
                break;
            case 34:
                html.exibirTotais('DATA', objAux);
                break;
            case 35:
                html.totalDeCotasOficiasPracas(objAux);
                break;
            case 36:
                html.exibirTotais('SIAPE', objAux);
                break;
            case 37:
                html.cotasNoCalendario(objAux);
                break;
            case 40:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'200', tempo:'04'});
                break;
            case 41:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'250', tempo:'05'});
                break;
            case 42:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'300', tempo:'06'});
                break;
            case 43:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'350', tempo:'07'});
                break;
            case 44:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'400', tempo:'08'});
                break;
            case 45:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'450', tempo:'09'});
                break;
            case 46:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'500', tempo:'10'});
                break;
            case 47:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'550', tempo:'11'});
                break;
            case 48:
                editarCota.alterarDuracaoTodasAsCotasFiltradas({valor:'600', tempo:'12'});
                break;
            default:
                alert('Opção não definida!')
                break;
        }
        conf.ultimoComando = opcao;
    },
    exibirTotais:function(campoDePesquisa, objAux) {
        limparTudo();
        const tmp = totais(campoDePesquisa, objAux);
        const tb = document.createElement('table');
        const tbody = document.createElement('tbody');
        const tfoot = document.createElement('tfoot');
        let totalGeral = 0;
        tb.id = 'tbResultado';
        tb.innerHTML = '<thead><tr><th><a href="#" onClick="ordenarTabela(0,false)">DESCRIÇÃO</a></th><th><a href="#" onClick="ordenarTabela(1,true)">TOTAL</a></th></tr></thead>';
        for (const key in tmp) {
            if (Object.hasOwnProperty.call(tmp, key)) {
                const total = tmp[key];
                const tr = document.createElement('tr');
                tr.innerHTML = `<tr><td style='text-align:left'>${key}</td><td style='text-align:center'>${total.toLocaleString('pt-BR')}</td></tr>`;
                totalGeral = totalGeral + total;
                tbody.append(tr);
            }
        }
        tfoot.innerHTML = `<tr><td>TOTAL GERAL</td><td>${totalGeral.toLocaleString('pt-BR')}</td></tr>`;
        
        tb.append(tbody);
        tb.append(tfoot);
        $('divResultado').append(tb);
        // setTimeout(() => {
        //     ordenarTabela(0);
        // }, 200);
    },
    escalasParaBg:function(info){

        limparTudo();

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
            _incluirLinha(`<td class="label_data">${info.POSTO_GRAD}</td>
                        <td class="label_data${((info.ESCALADO.indexOf('próprio') === -1 && info.ESCALADO !== '') ? ' escalaCompulsoria' : '')}" title="${info.ESCALADO}">${info.NOME}</td>
                        <td id="${info._ID}" class="label_data" ondblclick = editarCota.carregarInterface('div${info._ID}')>${info.SIAPE}</td>
                        <td class="label_data">${info.LOTAÇÃO}</td>
                        <td class="label_data">${info.QUADRO}</td>
                        <td class="label_data">${info.ALA}</td>
                        <td class="label_data${(info.FALTA===true ? ' faltou' : '')}">${info.ASSINATURA}</td>`)
        }
        function _incluirLinha(stringHtml){
            const tr = document.createElement('tr')
            tr.innerHTML = stringHtml
            table.append(tr)
        }
    },
    exibirListaDeVoluntariosEscalados: function(objAux){
        limparTudo();
        if(objAux.length == 0){
            alert('Nenhum dado caregado ainda!');
            return 0;
        }
        const arrObjTmp = objAux.map((e)=>{ return {
            'DATA':e.DATA, 
            'HORA':e.HORA, 
            'GBM de DESTINO':e.GBM_DESTINO, 
            'POSTO/GRAD':e.POSTO_GRAD, 
            'QUADRO':e.QUADRO,'NOME':e.NOME, 
            'SIAPE':e.SIAPE, 
            'OPERAÇÃO':e.OPERAÇÃO,
            'FUNÇÃO':e.name_cinco
        } });
        const divResultado = $('divResultado');
        const tb = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        tb.id = 'tbResultado';
        divResultado.append(tb);
        for(i = 0; i < arrObjTmp.length; i++){
            if(i == 0){
                thead.append(html._construirTabela(arrObjTmp[i], -1));
            }
            tbody.append(html._construirTabela(arrObjTmp[i], i));
        }
        tb.append(thead);
        tb.append(tbody);
    },
    exibirPercentualDeFaltas: function(objAux){
        
        if(dadoEscalasJson.length == 0 || dadoFaltasJson.length == 0){
            alert('É necessário informar os dados da ESCALA e dados das FALTAS para processamento!');
            return false;
        }

        html.exibirTotais('OPERAÇÃO', objAux);

        const tbAux = $('tbResultado');

        let intTotalGeralFaltas = 0;
        let intTotalGeral = 0;

        for(let i = 0; i < tbAux.childElementCount; i++){
            const secAux = tbAux.children[i];
            for(let j = 0; j < secAux.childElementCount; j++){
                const trAux = secAux.children[j];
                const objTmp = filtrarFaltasJson({operacao:trAux.children[0].innerHTML});
                const thAuxFalta = document.createElement('th');
                const thAuxPerc = document.createElement('th');
                const tdAuxFalta = document.createElement('td');
                const tdAuxPerc = document.createElement('td');
                tdAuxFalta.style.textAlign = 'center';
                tdAuxPerc.style.textAlign = 'center';

                thAuxFalta.innerHTML = 'FALTAS';
                thAuxPerc.innerHTML = 'PERCENTUAL';
                                
                let intTotal = parseInt('0'+trAux.children[1].innerHTML.replace('.',''));
                let intFaltas = objTmp.length;
                let intPercent = ((intFaltas * 100) / intTotal).toFixed(2);
                intTotalGeral = intTotalGeral + intTotal;
                intTotalGeralFaltas = intTotalGeralFaltas + intFaltas;

                tdAuxFalta.innerHTML = intFaltas;
                tdAuxPerc.innerHTML = `${intPercent} %`;

                if(trAux.children[0].innerHTML=='<a href="#" onclick="ordenarTabela(0,false)">DESCRIÇÃO</a>'){
                    trAux.append(thAuxFalta);
                    trAux.append(thAuxPerc);
                }
                else if(trAux.children[0].innerHTML=='TOTAL GERAL'){
                    tdAuxFalta.innerHTML = intTotalGeralFaltas;
                    intTotalGeral = parseInt('0'+trAux.children[1].innerHTML.replace('.',''))
                    tdAuxPerc.innerHTML = `${((intTotalGeralFaltas * 100) / intTotalGeral).toFixed(2)} %`;
                    trAux.append(tdAuxFalta);
                    trAux.append(tdAuxPerc);
                }
                else{
                    trAux.append(tdAuxFalta);
                    trAux.append(tdAuxPerc);
                }
            }
        }

    },
    exibirCotaDobrada: function() {
        limparTudo();
        const objAux = filtrarEscalasJson(_parametros());
        const arrDia = objAux.map((item) => `${item.DATA}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
        const table = document.createElement('table')
        table.innerHTML = `<tr><th>DIA</th><th>SIAPE</th><th>ACHADOS</th></tr>`
        for(let i = 0; i < arrDia.length; i++) {
            const objDia = objAux.filter((item)=>{if(item.DATA === arrDia[i]){return item}})
            const objTotalSiape = totais('SIAPE', objDia)
            for (const property in objTotalSiape) {
                const tr = document.createElement('tr')
                if(objTotalSiape[property]>1){
                    tr.innerHTML = `<td>${arrDia[i]}</td><td style="text-align:center">${property}</td><td style="text-align:center">${objTotalSiape[property]}</td>`
                    table.append(tr)
                }
            }
        }
        $('divResultado').append(table)
    },
    totalDeCotasEscaladas: function(objAux){
        limparTudo();
        let par = _parametros();
        
        let contabilizar_total = 0
        const arrOperacao = objAux.map((item) => `${item.OPERAÇÃO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
        const table = document.createElement('table')
        // table.append(_exibirParametrosUsados())
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

        function _exibirParametrosUsados(){
            const tr = document.createElement('tr')
            const par = JSON.stringify(_parametros())
            tr.innerHTML = `<th colspan="3" style="color:gray">PARÂMETROS: ${(par == '{}'  ? '{"Nenhum filtro aplicado"}': par)}</th>`
            return tr
        }
        function _cabecalho1() {
            const tr = document.createElement('tr')
            tr.innerHTML = `<th colspan="3">RESUMO DE COTAS - ${conf.mesAno.toUpperCase()}</th>`
            return tr
        }
        function _cabecalho2() {
            const tr = document.createElement('tr')
            tr.innerHTML = `<th>OPERAÇÃO / GBM DE DESTINO</th>` +
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
            
            let totaisGbm = JSON.stringify(totais('GBM_DESTINO', obj)).
                replaceAll('"','').
                replaceAll(':',': ').
                replaceAll(',',') (').
                replaceAll('{','(').
                replaceAll('}',')')

            tr.innerHTML = `<td style="text-align:left">${obj[0].OPERAÇÃO}<br><span style="color:gray">${totaisGbm}</span></td>` + 
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
    },
    totalDeCotasOficiasPracas: function(objAux){
        const arrOperacoes = Object.keys(totais('OPERAÇÃO', objAux)).sort()
        const arrDatasNoMes = Object.keys(totais('DATA', objAux)).sort()
        let dadoTemp = []
        let listaDeOperacoes = ''
        
        for(let i = 0; i < arrDatasNoMes.length; i++){
            const dataTemp = objAux.filter((item, index) => {if(objAux[index].DATA == arrDatasNoMes[i]) {return item}})
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
    
        limparTudo();
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
    },
    totalDeMilitaresEnvolvidos:function (arrAux) {
        limparTudo();

        const arrGrupo = arrAux.map((item) => `${item.GRUPO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        
        for(let i = 0; i < arrGrupo.length; i++) {
            _criarTagGrupo(`GRUPO-${i}`, `${arrGrupo[i]}`);
            const objGbmDestino = arrAux.filter((item) => {if(item.GRUPO === arrGrupo[i]){return item}});
            const arrGbmDestino = objGbmDestino.map((item) => `${item.GBM_DESTINO}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort(ordenarPorGBM);

            for(let k = 0; k < arrGbmDestino.length; k++) {
                _criarTagGbmDestino(`GRUPO-${i}`, `GBM-${k}`, arrGbmDestino[k]);
                _carregarSiape(i, arrGrupo, k, arrGbmDestino);
            }
        }
        
        _incluirBotaoOcultar()
        _incluirCabecalhoParaPdf()
        
        function _incluirBotaoOcultar(){
            const divAuxiliar = document.getElementById('divAuxiliar')
            const btnCriarPdf = document.createElement('button')
            const btnOcultarCotas = document.createElement('button')

            btnOcultarCotas.id = 'cmdOcultarCotas'
            btnOcultarCotas.innerHTML = 'Ocultar/Reexibir Totais de Cotas'
            btnOcultarCotas.addEventListener('click', (e)=>{
                e.preventDefault()
                const ctrs = document.querySelectorAll(".visivel")
                ctrs.forEach((ctr) => ctr.classList.toggle("invisivel"))
            })
            
            btnCriarPdf.id = 'cmdCriarPDF'
            btnCriarPdf.innerHTML = 'Criar PDF'
            btnCriarPdf.addEventListener('click', (e)=>{
                e.preventDefault()
                setTimeout(()=>{
                    if(confirm(`Deseja baixar esses dados convertidos em um arquivo PDF?`)){
                        gerarPdf(divResultado)
                        document.getElementById('divAuxiliar').innerHTML=''
                    }
                },500)
            })

            divAuxiliar.append(btnOcultarCotas)
            divAuxiliar.append(btnCriarPdf)
        }

        function _incluirCabecalhoParaPdf(){
            const tbResultado = document.getElementById('tbResultado');
            const cabecalhoH1 = document.createElement('h1');
            cabecalhoH1.innerHTML = `TOTAL DE MILITARES ENVOLVIDOS<br>GSV de ${arrAux[0].MÊS}/${arrAux[0].DATA.split("/")[2]}`;
            cabecalhoH1.style.display = 'flexbox';
            cabecalhoH1.style.textAlign = 'center';
            cabecalhoH1.style.width = '100%';
            cabecalhoH1.style.padding = '10px';
            cabecalhoH1.style.fontSize = '130%';
            divResultado.insertBefore(cabecalhoH1, tbResultado);
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
            const objTodos = arrAux.filter((item) => {
                if(item.SIAPE !== 'SV' && item.GRUPO === strGrupo && item.GBM_DESTINO === strGbmDestino){return item}
            })
            const arrTotalGeral = objTodos.filter((elem, index, arr) => arr.indexOf(elem) === index)

            const arrTips = objTodos.map((item) => `${item.OPERAÇÃO}`).filter((elem, index, arr) => arr.indexOf(elem) === index)

            //Totalizando Praças
            const objPraca = arrAux.filter((item) => {
                if(item.SIAPE !== 'SV' && item.QUADRO.indexOf('QBMG')>-1 && item.GRUPO === strGrupo && item.GBM_DESTINO === strGbmDestino){return item}
            })
            const arrTotalPraca = objPraca.map((item) => `${item.SIAPE}`).filter((elem, index, arr) => arr.indexOf(elem) === index)
            //Totalizando Oficiais
            const objOficial = arrAux.filter((item) => {
                if(item.SIAPE !== 'SV' && item.QUADRO.indexOf('QOBM')>-1 && item.GRUPO === strGrupo && item.GBM_DESTINO === strGbmDestino){return item}
            })
            const arrTotalOficial = objOficial.map((item) => `${item.SIAPE}`).filter((elem, index, arr) => arr.indexOf(elem) === index);

            const tdGbmDestino = document.getElementById(`GRUPO-${codGrupo}-GBM-${codGbmDestino}`);
            tdGbmDestino.children[0].title = `${_tipsOperacoes(arrTips)}`;
            tdGbmDestino.children[1].innerHTML = `<span class=visivel>${arrTotalGeral.length}</span>`; //'' Total de Cotas
            tdGbmDestino.children[2].innerHTML = `${arrTotalOficial.length}`; //'' Total de Oficiais
            tdGbmDestino.children[3].innerHTML = `${arrTotalPraca.length}`; //'' Total de Praças
        }

        function _tipsOperacoes(arr){
            let txt = ''
            for(i = 0; i < arr.length; i++) {txt += arr[i] + '\n'}
            return txt
        }
    },
    cotasNoCalendario: function(objAux){
        $('divResultado').innerHTML = '';
        if(objAux.length == 0){ return }
        
        const divResultado = $('divResultado');
        const divAuxiliar = $('divAuxiliar');
        const divCalendario = document.createElement('div');
        const totDia = totais("DATA", objAux);
        const lblTitulo = document.createElement('label');
        
        divCalendario.className = "clsCalendario clsCalendarioResultado";
        divResultado.append(divCalendario);
        lblTitulo.innerHTML = `CONTAGEM DE COTAS <br>${conf.mesAno.toUpperCase()}`;
        lblTitulo.style = 'font-size:18px; font-weight:bold';
        
        if($('divAuxiliar').innerHTML.toString().indexOf('Calendario') == -1){
            $('divAuxiliar').innerHTML = '';
            divAuxiliar.append(_inserirBotoesDeControle());
            divAuxiliar.append(lblTitulo);
        }

        let dataInicio = _extrairDataInicio(objAux[0].DATA);
        let dataAux = new Date(dataInicio);
        let dataTermino = new Date(dataAux.setMonth(dataAux.getMonth()+1));
        dataTermino = new Date(dataAux.setDate(dataAux.getDate()-1));

        dataAux = new Date(dataInicio);
        divCalendario.innerHTML = `
                                <div style="text-align:center">Domingo</div>
                                <div style="text-align:center">Segunda</div>
                                <div style="text-align:center">Terça</div>
                                <div style="text-align:center">Quarta</div>
                                <div style="text-align:center">Quinta</div>
                                <div style="text-align:center">Sexta</div>
                                <div style="text-align:center">Sábado</div>`;

        
        while(dataAux <= dataTermino){
            if( dataAux.getDate() == 1){
                for(let i = 0; i < 7; i++){
                    if(i < dataAux.getDay()){
                        divCalendario.appendChild(_criarDivDia());
                    }else{break}
                }
            }
            const divDiaDoMes = _criarDivDia(dataAux);
            divDiaDoMes.innerHTML += `<div style="font-size:20px; display:flex-inline; position:relative; text-align:center">${(totDia[dataAux.toLocaleDateString('pt-BR')] == undefined ? `` : totDia[dataAux.toLocaleDateString('pt-BR')])}</div>`;
            divDiaDoMes.addEventListener('mousemove',(e)=>{
                const divTmp = e.target.parentElement;
                if(divTmp.title==''){
                    const dtDiaAux = divTmp.ariaValueText;
                    const detalheTitle = document.getElementsByName('radTipoClassificacaoDetalhe')[0].checked ? _extrairOperacoes(dtDiaAux) : _extrairGbmDestino(dtDiaAux);
                    divTmp.title = detalheTitle;
                }
            })
            divCalendario.appendChild(divDiaDoMes);
            dataAux = new Date(dataAux.setDate(dataAux.getDate()+1));
        }
        

        function _criarDivDia(dtAux){
            const divTemp = document.createElement('div');
            divTemp.id = 'divDiaDoMes'+(dtAux == undefined ? '-' : ("00"+dtAux.getDate()).slice(-2));
            divTemp.ariaValueText = dtAux == undefined ? '' : dtAux.toLocaleDateString('pt-BR');
            divTemp.className = 'clsDiaCalendario';
            divTemp.innerHTML = (dtAux==undefined ? '-' : 'dia '+("00"+dtAux.getDate()).slice(-2));
            return divTemp
        }
        function _extrairDataInicio(strData) {
            const arrData = strData.split('/');
            const dataInicio = new Date(`${arrData[2]}-${arrData[1]}-01T00:00:00`);
            return dataInicio;
        }
        function _extrairOperacoes(dataAux){
            let par = _parametros();
            if(par.data){
                par.data.push(dataAux);
            }
            else{
                par.data = [dataAux];
            }
            const objAux = filtrarEscalasJson(par);
            const tmp = totais("OPERAÇÃO", objAux);
            let ret = [];
            for (const key in tmp) {
                if (Object.hasOwnProperty.call(tmp, key)) {
                    const total = tmp[key];
                    const chave = key;
                    ret.push(`${chave}: (${total})|`);
                }
            }
            return (ret.sort()).toString().replaceAll('|,', '\n').replace('|','');
        }
        function _extrairGbmDestino(dataAux){
            let par = _parametros();
            if(par.data){
                par.data.push(dataAux);
            }
            else{
                par.data = [dataAux];
            }
            const objAux = filtrarEscalasJson(par);
            const tmp = totais("GBM_DESTINO", objAux);
            let ret = [];
            for (const key in tmp) {
                if (Object.hasOwnProperty.call(tmp, key)) {
                    const total = tmp[key];
                    const chave = key;
                    ret.push(`${chave}: (${total})|`);
                }
            }
            return (ret.sort()).toString().replaceAll('|,', '\n').replace('|','');
        }
        function _inserirBotoesDeControle(){
            const fld = document.createElement('fieldset');
            const btn = document.createElement('button');
            const rad1 = document.createElement('input');
            const rad2 = document.createElement('input');
            const lab1 = document.createElement('label');
            const lab2 = document.createElement('label');
            
            fld.id = 'fldAtualizarCalendario';
            rad1.type = 'radio';
            rad1.name = 'radTipoClassificacaoDetalhe';
            rad2.name = rad1.name;
            rad1.checked = true;
            rad2.type = 'radio';
            lab1.innerHTML = 'Totais por Operação (no detalhe)';
            lab2.innerHTML = 'Totais por GBM de Destino (no detalhe)';
            btn.id = 'btnAtualizarCalendario';
            btn.style = 'display:flex; margin:0 auto;';
            btn.innerHTML = 'Atualizar';
            btn.addEventListener('click', (e)=>{
                const objAux = filtrarEscalasJson(_parametros());
                html.cotasNoCalendario(objAux);
            })
            rad1.addEventListener('change', (e)=>{
                const objAux = filtrarEscalasJson(_parametros());
                html.cotasNoCalendario(objAux);
            })
            rad2.addEventListener('change', (e)=>{
                const objAux = filtrarEscalasJson(_parametros());
                html.cotasNoCalendario(objAux);            
            })
            lab1.append(rad1);
            lab2.append(rad2);
            fld.append(lab1);
            fld.append(lab2);
            fld.append(btn);
            return fld;
        }
    },
    criarArquivoExcel: function(){
        if(dadoEscalasJson.length == 0){
            alert('Não há dados a serem processados!');
            return false;
        }
    
        const objAux = dadoEscalasJson.map(e =>{
            return {
                'GRAD':e.POSTO_GRAD, 
                'NOME':e.NOME,
                'SIAPE':e.SIAPE,
                'GBM_ORIGEM':e.LOTAÇÃO,
                'QUADRO':e.QUADRO,
                'ALA':e.ALA,
                'CIRCULO':e.CIRCULO,
                'DATA':e.DATA,
                'HORA':e.HORA,
                'GBM_DESTINO':e.GBM_DESTINO,
                'LOCAL':e.LOCAL,
                'OPERAÇÃO':e.OPERAÇÃO,
                'GRUPO':e.GRUPO,
                'TEMPO':e.TEMPO,
                'VALOR':e.VALOR,
                'MES':e.MÊS,
                'FALTA':e.FALTA,
                'QUINZENA':e.QUINZENA
            }
        })
        
        html.construirGrade(objAux)
    
        const tbRes = $('tbResultado');
        const Dados = new Blob(["\ufeff" + tbRes.outerHTML], {type:"application/vnd.ms-excel"});
        const url = window.URL.createObjectURL(Dados);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'NomeDoArquivo';
        a.click();
    },
    construirPlanilha: function (objAux) {
    
        limparTudo();
    
        if(objAux.length == 0){
            alert(`Não há dados a serem processados.`);
            return;
        }
        const objOper = totais('OPERAÇÃO',objAux);
        const mesAno = (`${_extrairMesExtenso(objAux[0].DATA)}/${objAux[0].DATA.split('/')[2]}`).toUpperCase();
        
        let totalDeColunasDias = _qtdMaxColunasParaDias(objAux);
    
        let cotasTotal = objAux.length;
        let militaresTotal = 0;
        let contador = 0;
        let valorTotal = 0;
        
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const tfoot = document.createElement('tfoot');
        thead.append(_cabecalhoLinha1(totalDeColunasDias));
        thead.append(_cabecalhoLinha2(totalDeColunasDias));
        thead.append(_cabecalhoLinha3(totalDeColunasDias));
        table.append(thead);
        for(let i = 0; i < arrOrdemPostoGrad.length; i++){
            objPosto = objAux.map((item)=>{return {
                    _ID:item._ID,
                    SIAPE:item.SIAPE,
                    NOME:item.NOME,
                    POSTO_GRAD:item.POSTO_GRAD,
                    DATA:item.DATA,
                    TEMPO:item.TEMPO,
                    VALOR:item.VALOR,
                    FALTA:item.FALTA,
                    OPERAÇÃO:item.OPERAÇÃO
                }})
            .filter((item)=>{if(item.POSTO_GRAD===arrOrdemPostoGrad[i]){return item}});
            if(objPosto.length > 0){
                const arrSiape = objPosto.map((item) => `${item.SIAPE}`).filter((elem, index, arr) => arr.indexOf(elem) === index).sort()
                for(let j = 0; j < arrSiape.length; j++){
                    objSiape = objPosto.filter((item)=>{if(item.SIAPE === arrSiape[j]){return item}}).sort(_ordenarPorData);
                    tbody.append(_linhasContendoDados(objSiape));
                }
            }
        }
        tfoot.append(_rodapeLinha1(totalDeColunasDias));
        tfoot.append(_rodapeLinha2(totalDeColunasDias));
        tfoot.append(_rodapeLinha3(totalDeColunasDias));
        
        table.append(tbody);
        table.append(tfoot);
        divResultado.append(table);

        _opcoesParaFaltas();
        
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
            tdValor.className = "label_data_valor"
    
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
                    // tdDia.innerHTML = `<a href='#' onclick='console.log(${obj[l]._ID})'>${obj[l].DATA.split('/')[0]}</a>`;
                    tdDia.innerHTML = obj[l].DATA.split('/')[0];
                    tdDia.id = obj[l]._ID;
                    auxTempo = auxTempo + parseInt(obj[l].TEMPO)
                    auxValor = auxValor + parseInt(obj[l].VALOR)
                    if(obj[l].TEMPO === '24'){tdDia.style.backgroundColor = '#99f'} //cor da cota dupla
                    if(obj[l].FALTA === true){tdDia.style.backgroundColor = '#faa'}
                    tdDia.title = obj[l].OPERAÇÃO;
                    const tdOutroDia = tdDia.cloneNode(true);
                    if (obj[l].TEMPO === '24'){
                        tr.append(tdOutroDia);
                        cotasTotal = cotasTotal + 1;
                    }
                    tdDia.addEventListener('dblclick', (e)=>{
                        editarCota.carregarInterface('div'+obj[l]._ID);
                    })
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

        function _opcoesParaFaltas(){
            if(dadoFaltasJson.length > 0){
                const divAuxilar = $('divAuxiliar');
                const btnAtualizar = document.createElement('button');
                btnAtualizar.id = 'btnAtualizar';
                btnAtualizar.innerHTML = 'Atualizar';
                btnAtualizar.style.padding = '10px'
                btnAtualizar.addEventListener('click', (e)=>{
                    const objAux = filtrarEscalasJson(_parametros());
                    html.construirPlanilha(objAux);
                });
                divAuxilar.append(btnAtualizar);
            }
        }
    },
    construirTabelaInscritos:function () {
        limparTudo();
        if(dadoInscritosJson.length == 0){
            alert('Não há registro sobre INSCRITOS foi carregado!');
            return;
        }
        const table = document.createElement('table')
        table.append(_cabecalho1());
        table.append(_cabecalho2());
        let indice = 0;
        let mesDeReferencia = '';
        let tCursos = $('txtCursos').value == '' ? undefined : $('txtCursos').value;
        let total = 0;
    
        for (let i = 0; i < arrOrdemPostoGrad.length; i++) {
            const objAux =  _ordenarDados(filtrarInscritosJson({ posto_grad: arrOrdemPostoGrad[i], cursos: tCursos }));
            if(objAux.length > 0){
                for(j = 0; j < objAux.length; j++){
                    if(mesDeReferencia === ''){ mesDeReferencia = objAux[j].MES_REFERENCIA }
                    table.append(_incluirDado(objAux[j], ++indice));
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
    },
    construirGrade: function (objAux) {
        if(objAux.length == 0){
            alert('Não há dados a serem exibidos!');
            return 0;
        }

        limparTudo();
    
        const col = Object.keys(objAux[0]);
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
    
        table.id = 'tbResultado';
        divResultado.append(table);

        table.append(_cabecalho());
        table.append(tbody);

        for (let i = 0; i < objAux.length; i++) {
            const item = objAux[i];
            tbody.append(_registro(item, i+1));
        }
        
        function _cabecalho(){
            const tr = document.createElement('tr');
            const thNumerador = document.createElement('th');
            let idx = 0;
            thNumerador.innerHTML = `<a href="#" onclick='ordenarTabela(${idx++})'>#</a>`
            tr.append(thNumerador);
            col.forEach((e)=>{
                const th = document.createElement('th');
                th.innerHTML = `<a href="#" onclick='ordenarTabela(${idx++})'>${e}</a>`;
                tr.append(th);
            })
            thead.append(tr);
            return thead;
        }
        
        function _registro(item, numerador){
            const tr = document.createElement('tr');
            const tdNumerador = document.createElement('td');
            tdNumerador.innerHTML = numerador;
            tr.append(tdNumerador);
            for (const key in item) {
                if (item.hasOwnProperty.call(item, key)) {
                    const elm = item[key];
                    const td = document.createElement('td');
                    td.innerHTML = elm;
                    if(elm === "FALTOU"){ td.className = "faltou" }
                    tr.append(td);
                }
            }
            return tr;
        }
    },
    _construirTabela: function (objAux, index){
        let col = 0;
        if(index == -1){
            const tr = document.createElement('tr');
            for (const key in objAux) {
                if (Object.hasOwnProperty.call(objAux, key)) {
                    const element = key;
                    const th = document.createElement('th');
                    th.innerHTML = `<th><a href='#' onclick='ordenarTabela(${col++})' class='clsClassificarCabecalho'>${element}</a></th>`;
                    tr.append(th);
                }
            }
            return tr
        }
        
        const tr = document.createElement('tr');
        for (const key in objAux) {
            if (Object.hasOwnProperty.call(objAux, key)) {
                const valor = objAux[key];
                const td = document.createElement('td');
                td.innerHTML = `<td>${valor}</td>`;
                tr.append(td);
            }
        }
        return tr;
    },
    atualizacaoAutomatica: function(){
        if(!conf.ultimoComando){return false};
        if(conf.ultimoParametro != JSON.stringify(_parametros())){
            conf.automatico = setTimeout(() => {
                clearTimeout(conf.automatico);
                html.processarMenuExibirResultado(conf.ultimoComando);
                conf.ultimoParametro = JSON.stringify(_parametros());
            }, 500);
        }
    }
}

const editarCota = {
    carregarInterface: function(id){
        $ajax({urlDoArquivo:'editar.html', funcaoDeRetorno:(conteudoHtml)=>{
            const div = document.createElement('div');
            const divId = id;
            id = id.toString().replace('div','');
            div.id = divId;
            div.className = "divDialogoEdicao";
            div.innerHTML = conteudoHtml;
            $(id).insertBefore(div, $(id).children[0]);
            $('btnEditarUpdate').addEventListener('click', (e)=>{
                editarCota.alterarDados($('txtEditarIndex').value);
                $('div'+id.toString()).style.display = 'none';
                setTimeout(()=>{
                    const par = _parametros('duracao');
                    dados.carregarDuracao();
                    editarCota.destacarSelecionados($('divFiltroDuracao'), par.tempo)
                    setTimeout(() => {  
                        const objAux = filtrarEscalasJson(_parametros());
                        html.construirPlanilha(objAux);
                    }, 500);
                },200);
                limparTudo();
                
                
            })
            $('btnEditarCancel').addEventListener('click', (e)=>{
                $(id.toString()).removeChild($(id.toString()).children[0]);
            })
        }})

        const timerDeAlteracao = setInterval(() => {
            if($('txtEditarId')){
                clearInterval(timerDeAlteracao);
                const id = parseInt(document.querySelector('.divDialogoEdicao').id.replace('div',''));
                editarCota.carregarDadosParaAlteracao(id);
            }
        }, 100)
    },
    alterarDados: function(indx, funcRetornno = undefined){
        if(dadoEscalasJson[parseInt(indx)]._ID === parseInt($('txtEditarId').value)){
            dadoEscalasJson[parseInt(indx)].FALTA = ($('selEditarFalta').value === 'true' ? true : false);
            dadoEscalasJson[parseInt(indx)].TEMPO = $('selEditarDuracao').value.toString();
            dadoEscalasJson[parseInt(indx)].VALOR = parseInt($('selEditarDuracao').value) * 50
            dadoEscalasJson[parseInt(indx)].ASSINATURA = ($('selEditarFalta').value === 'true' ? `AUDITORIA` : ``);
        }
        if(funcRetornno){funcRetornno()}
    },
    carregarDadosParaAlteracao: function(id){
        for(let i = 0; i < dadoEscalasJson.length; i++){
            if(dadoEscalasJson[i]._ID === id){
                $('txtEditarId').value = dadoEscalasJson[i]._ID;
                $('txtEditarIndex').value = i;
                $('txtEditarOperacao').value = dadoEscalasJson[i].OPERAÇÃO;
                $('txtEditarDataHora').value = `${dadoEscalasJson[i].name_tres} - ${dadoEscalasJson[i].name_quatro}`;
                $('txtEditarNome').value = `${dadoEscalasJson[i].POSTO_GRAD} ${dadoEscalasJson[i].QUADRO} ${dadoEscalasJson[i].NOME} - ${dadoEscalasJson[i].SIAPE}`;
                $('txtEditarLotacao').value = `Lotação: ${dadoEscalasJson[i].LOTAÇÃO}`;
                $('selEditarFalta').value = dadoEscalasJson[i].FALTA;
                $('selEditarDuracao').value = dadoEscalasJson[i].TEMPO;
                break;
            }
        }
    },
    alterarDuracaoTodasAsCotasFiltradas: function(dadosParaAlteracao) {
        try {
            const par = _parametros();
            
            if(!confirm(`C U I D A D O!\n\n
                Esta alteração é de caráter AVANÇADO.\n
                Serão alterados o VALOR e a DURAÇÃO das cotas para:\n
                ${JSON.stringify(dadosParaAlteracao)}\n
                Conforme filtro informado:\n
                ${JSON.stringify(par)}\n
                Essa mudança se aplica apenas a essa seção de consulta e apenas nos dados em memória RAM.\n\n
                Deseja continuar?`)){
                return false;
            }
    
            const objAux = filtrarEscalasJson(par);
            const arrAux = objAux.map((item) => { return item._ID });
            for (let i = 0; i < dadoEscalasJson.length; i++) {
                if (arrAux.includes(dadoEscalasJson[i]._ID)) {
                    dadoEscalasJson[i].VALOR = dadosParaAlteracao.valor.toString();
                    dadoEscalasJson[i].TEMPO = dadosParaAlteracao.tempo;
                }
            }
            setTimeout(() => {
                dados.carregarControles()
            }, 500);

        } catch (error) {
            console.log(error);
        }
    },
    destacarSelecionados: function(controle, parametros){
        if(parametros==undefined){return}
        const divAux = controle;
        for(let i = 0; i < divAux.childElementCount; i++){
            const ctr = divAux.children[i];
            if(parametros.includes(ctr.ariaLabel)){
                ctr.ariaPressed = true;
            }
        }
    }
}

//Area de testes




//Funções Complementares

const $ajax = ({urlDoArquivo, funcaoDeRetorno}) => {
    try {
        const url = urlDoArquivo;
        const XmlReq = new XMLHttpRequest();
        XmlReq.open('GET', url, true);
        XmlReq.onreadystatechange = () => {
            if (XmlReq.readyState === 4) {
                if (XmlReq.status === 200) {
                    funcaoDeRetorno(XmlReq.response);
                }
                if (XmlReq.status === 404) {
                    funcaoDeRetorno(null);
                }
            }
        }
        XmlReq.send();
    } catch (error) {
        console.log(error);
    }
}

function $led(cod) {
    const stEsc = $('divStatusEscala');
    const stFal = $('divStatusFalta');
    const stIns = $('divStatusInscricao');

    if(cod==10){
        stEsc.style.backgroundColor = 'red';
    }
    if(cod==11){
        stEsc.style.backgroundColor = 'yellow';
    }
    if(cod==12){
        stEsc.style.backgroundColor = 'lightgreen';
    }

    if(cod==20){
        stFal.style.backgroundColor = 'red';
    }
    if(cod==21){
        stFal.style.backgroundColor = 'yellow';
    }
    if(cod==22){
        stFal.style.backgroundColor = 'lightgreen';
    }

    if(cod==30){
        stIns.style.backgroundColor = 'red';
    }
    if(cod==31){
        stIns.style.backgroundColor = 'yellow';
    }
    if(cod==32){
        stIns.style.backgroundColor = 'lightgreen';
    }
}

function gerarPdf_old(tag) {
    const content = tag
    const options = {
        margin:[10,10,10,10],
        filename:`${conf.arquivo}.pdf`,
        html2canvas:{scale: 2},
        jsPDF:{ unit: "mm", format: "a4", orientation: "portrait" }
    }
    html2pdf().set(options).from(content).save()
}

function gerarPdf(){
    const conteudo = $('divResultado').innerHTML;

    const estilo = `<style>
                    *{
                        font-size: 14px;
                        font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
                        padding: 2px;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    @page 
                    {
                        size: auto;
                        margin-top: 0mm;
                        margin-rigth: 20mm;
                        margin-left: 20mm;
                        margin-bottom: 0mm;
                    }
                    h1{
                        margin-top: 20mm
                    }
                    .invisivel{
                        display: none;
                    }              
                    .tabelaDeResultado{
                        margin: auto; 
                    }
                    .tabelaDeResultado,
                    .tabelaDeResultado > tbody > tr > th,
                    .tabelaDeResultado > tbody > tr > td{
                        border: solid 2px #888;
                        border-collapse: collapse;
                    }
                    .label_data{
                        text-align: center;
                    }
                    .name_tres{
                        background-color: #999;
                    }
                    </style>`;
    
    const win = window.open('','', 'heigth=700, width=700');

    
    win.document.write('<!DOCTYPE html>');
    win.document.write('<html>');
    win.document.write('<head>');
    win.document.write('<meta charset="UTF-8">');
    win.document.write('<title></title>');
    win.document.write(estilo);
    win.document.write('</head>');
    win.document.write('<body>');
    win.document.write(conteudo);
    win.document.write('</body>');
    win.document.write('</html>');

    win.print();
}

function totais(campoDePesquisa, obj) {
    // campoDePesquisa = campoDePesquisa.toUpperCase();
    const res = obj.reduce((acc, item) => {
        if (!acc[item[campoDePesquisa]]) {
            acc[item[campoDePesquisa]] = 1;
        }
        else {
            acc[item[campoDePesquisa]] = acc[item[campoDePesquisa]] + 1;
        }
        return acc;
    }, {})
    return res;
}

function limparTudo(){
    divResultado.innerHTML = ""; divAuxiliar.innerHTML = "";
}

function _ordenarPorData(a, b){
    if(a.DATA == b.DATA){
        return 0;
    }
    if(a.DATA < b.DATA){
        return -1;
    }
    if(a.DATA > b.DATA){
        return 1;
    }
}

function ordenarPorGBM(a, b) {
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

function ordenarPorPostoGrad(indice){

    const asc = true;   // ordem: ascendente ou descendente
    const index = (indice == undefined? 0: indice);    // coluna pela qual se quer ordenar
    const tabela = document.getElementById('tbResultado');
    const arr = Array.from(tabela.querySelectorAll('tbody tr'));

    arr.sort((a, b) => {
        let a_val = undefined;
        let b_val = undefined;
        a_val = a.children[index].innerText;
        b_val = b.children[index].innerText;
        if(index == 3){
            a_val = arrOrdemPostoGrad.indexOf(a.children[index].innerText);
            b_val = arrOrdemPostoGrad.indexOf(b.children[index].innerText);
            return (asc) ? a_val > b_val : b_val > a_val; 
        }
        return (asc) ? a_val.localeCompare(b_val) : b_val.localeCompare(a_val);
    })

    arr.forEach(elem => {
        tabela.children[1].appendChild(elem)
    });
}

function ordenarTabela(indice){
    const index = (indice == undefined? 0: indice);    // coluna pela qual se quer ordenar
    const tabela = document.getElementById('tbResultado');
    const arr = Array.from(tabela.querySelectorAll('tbody tr'));
    const asc = (tabela.ariaSort == "false" ? false : true);   // ordem: ascendente ou descendente (true or false)
    tabela.ariaSort = !asc;

    arr.sort((a, b) => {
        let a_val = undefined; let b_val = undefined;
        a_val = a.children[index].innerText; b_val = b.children[index].innerText;
        // console.log(a_val, " >> ", b_val);
        if(a_val.indexOf('º') > -1 && b_val.indexOf('º') > -1){
            a_val = a_val.substr(0, a_val.indexOf("º"));
            b_val = b_val.substr(0, b_val.indexOf("º"));
        }
        if(Number.isInteger(parseInt(a_val)) && Number.isInteger(parseInt(b_val))){
            return (asc) ? a_val.localeCompare(b_val, undefined, {numeric: true}) : b_val.localeCompare(a_val, undefined, {numeric: true});
        }
        return (asc) ? a_val.localeCompare(b_val) : b_val.localeCompare(a_val);
    })

    arr.forEach(elem => {
        tabela.children[1].appendChild(elem);
    });
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

function _parametros(foco){
    const _divFiltroDurcao = $('divFiltroDuracao');
    const _divFaltaOpcao = $('divFaltaOpcao');
    const _divFiltroGrupo = $('divFiltroGrupo');
    const _divFiltroOperacao = $('divFiltroOperacao');
    const _divFiltroGbmDestino = $('divFiltroGbmDestino');
    const _divFiltroTurno = $('divFiltroTurno');
    const _divFiltroQuadro = $('divFiltroQuadro');
    const _divCalendario = $('divCalendario');
    const _filtroOpcao = $('divFiltroOpcao')
    const _quinzenaOpcao = $('divQuinzenaOpcao')
    
    let par = {};
    let arrDuracao = [];
    let arrFalta = [];
    let arrGrupo = [];
    let arrOper = [];
    let arrGbmDestino = [];
    let arrTurno = [];
    let arrQuadro = [];
    let arrData = [];
    let arrSiape = [];
    let arrQuinzena = [];
    
    if(foco == undefined || foco == `duracao`){ arrDuracao = _buscarSelecionados(_divFiltroDurcao) }
    if(foco == undefined || foco == `falta`){ arrFalta = _buscarSelecionados(_divFaltaOpcao) }
    if(foco == undefined || foco == `grupo`){ arrGrupo = _buscarSelecionados(_divFiltroGrupo) }
    if(foco == undefined || foco == `operacao`){ arrOper = _buscarSelecionados(_divFiltroOperacao) }
    if(foco == undefined || foco == `gbm_destino`){ arrGbmDestino = _buscarSelecionados(_divFiltroGbmDestino) }
    if(foco == undefined || foco == `turno`){ arrTurno = _buscarSelecionados(_divFiltroTurno) }
    if(foco == undefined || foco == `quadro`){ arrQuadro = _buscarSelecionados(_divFiltroQuadro) }
    if(foco == undefined || foco == `data`){ arrData = _buscarSelecionados(_divCalendario) }
    if(foco == undefined || foco == `opcao`){ arrSiape = _buscarSelecionados(_filtroOpcao) }
    if(foco == undefined || foco == `quinzena`){ arrQuinzena = _buscarSelecionados(_quinzenaOpcao) }
    
    if(arrDuracao.length > 0) { par.tempo = arrDuracao}
    if(arrFalta.length > 0) { par.falta = arrFalta}
    if(arrGrupo.length > 0) { par.grupo = arrGrupo}
    if(arrOper.length > 0) { par.operacao = arrOper }
    if(arrGbmDestino.length > 0) { par.gbm_destino = arrGbmDestino }
    if(arrTurno.length > 0){ par.horario = arrTurno }
    if(arrQuadro.length > 0){ par.quadro = arrQuadro }
    if(arrData.length > 0){ par.data = arrData }
    if(arrSiape.length > 0){
        if(arrSiape[0] != 'compulsória'){
            par.siape = arrSiape[0];
        }
        else{
            par.escaladoPor = 'compulsória';
        }
    }
    if(arrQuinzena.length > 0){
        par.quinzena = arrQuinzena[0];
    }
    if(arrFalta.length > 0){
        par.falta = (arrFalta[0] == 'true' ? true: (arrFalta[0] == 'false') ? false : '');
    } 

    $('divTotais').title = JSON.stringify(par);
    // conf.ultimaAtualizacao = new Date();
    // limparTudo();
    return par;

    function _buscarSelecionados(auxTag){
        let arrAux = [];
        for(let i = 0; i < auxTag.childElementCount; i++){
            const btnTemp = auxTag.children[i]
            if(btnTemp.nodeName.toLowerCase() == 'button'){
                if(btnTemp.ariaLabel != ""){
                    if(btnTemp.ariaPressed=="true"){
                        arrAux.push(btnTemp.ariaLabel);
                    }
                }
            }
        }
        return arrAux;
    }
}

function tratarFaltas() {
    if(dadoEscalasJson.length===0 || dadoFaltasJson.length===0){ return }
    
    if(dadoEscalasJson[0].DATA.split("/")[1] !== dadoFaltasJson[0].DATA.split("/")[1])
    {
        alert(`Períodos incompatívies para tratar faltas`);
        return;
    }
    
    let contador = 0;
    dadoEscalasJson.forEach((elm)=>{
        const filtroTurno = filtrarFaltasJson({siape:elm.SIAPE, data:elm.DATA, turno:elm.HORA});
        if(filtroTurno.length > 0){
            elm.ASSINATURA = 'FALTOU';
            elm.FALTA = true;
            contador = contador + 1;
        }
    })
    
    if(dadoFaltasJson.length != contador){
        $led(21);
    }
    $('divStatusFalta').title = `Processametno de faltas: ${dadoFaltasJson.length}/${contador}`;

    dadoFaltasJson.forEach((flt)=>{
        const filtroFalta = filtrarEscalasJson({siape:flt.SIAPE, data:flt.DATA, horario:flt.TURNO});
        if (filtroFalta.length == 0){
            console.log("(Falta não aplicada)", flt.SIAPE, flt.DATA, flt.TURNO,flt.LOCAL, flt.OPERAÇÃO);
        }
    })
}

function filtrarEscalasJson({ assinatura, data, escaladoPor, falta, grupo, gbm_destino, horario, lotacao, nome, operacao, operacao_tipo, quadro, quinzena, posto_grad, siape, sub_lotacao_local, tempo, cinco }) {
    
    let objAux = dadoEscalasJson.filter((e)=>{return e})

    if (assinatura !== undefined) {
        objAux = objAux.filter((e)=>{return e.ASSINATURA.indexOf(assinatura) > -1})
    }
    if (data !== undefined) {
        if(Array.isArray(data)){
            if(data.length > 0){
                objAux = objAux.filter((e)=>{return data.includes(e.DATA)})
            }
        }else{
            objAux = objAux.filter((e)=>{return data.includes(e.DATA)})
        }
    }
    if (escaladoPor !== undefined) {
        if(escaladoPor === 'compulsória'){
            objAux = objAux.filter((e)=>{return e.ESCALADO.split('-').length === 3});
        }else if(escaladoPor === 'próprio'){
            objAux = objAux.filter((e)=>{return e.ESCALADO.split('-').length === 2});
        }else{
            objAux = objAux.filter((e)=>{return e.ESCALADO.indexOf(escaladoPor) > -1});
        }
    }
    if (falta !== undefined) {
        objAux = objAux.filter((e)=>{return e.FALTA === falta});
    }
    if (grupo !== undefined) {
        if(Array.isArray(grupo)){
            if(grupo.length > 0){
                objAux = objAux.filter((e)=>{return grupo.includes(e.GRUPO)});
            }
        }
        else{
            objAux = objAux.filter((e)=>{return e.GRUPO.indexOf(grupo) > -1})
        }
    }
    if (gbm_destino !== undefined) {
        if(Array.isArray(gbm_destino)){
            if(gbm_destino.length > 0){
                objAux = objAux.filter((e)=>{return gbm_destino.includes(e.GBM_DESTINO)});
            }
        }
        else{
            objAux = objAux.filter((e)=>{return e.GBM_DESTINO.indexOf(gbm_destino) > -1})
        }
    }
    if (horario !== undefined) {
        if(Array.isArray(horario)){
            if(horario.length > 0){
                objAux = objAux.filter((e)=>{return horario.includes(e.HORA)})
            }
        }
        else{
            objAux = objAux.filter((e)=>{return e.HORA.indexOf(horario) > -1})
        }
    }
    if (lotacao !== undefined) {
        objAux = objAux.filter((e)=>{return e.LOTAÇÃO.indexOf(lotacao) > -1})
    }
    if (nome !== undefined) {
        objAux = objAux.filter((e)=>{return e.NOME.indexOf(nome) > -1})
    }
    if (operacao !== undefined) {
        if(Array.isArray(operacao)){
            if(operacao.length > 0){
                objAux = objAux.filter((e)=>{return operacao.includes(e.OPERAÇÃO)})
            }
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
        if(Array.isArray(tempo)){
            objAux = objAux.filter((e)=>{return tempo.includes(e.TEMPO)})
        }
        else{
            tempo = tempo.toString()
            if (tempo.indexOf('12/24') > -1){
                objAux = objAux.filter((e)=>{return e.TEMPO=='12' || e.TEMPO == '24'})
            }else{
                objAux = objAux.filter((e)=>{return e.TEMPO.indexOf(tempo) > -1})
            }
        }
    }
    if (cinco!==undefined) {
        if(Array.isArray(cinco)){
            if(cinco.length > 0){
                objAux = objAux.filter((e)=>{return cinco.includes(e.name_cinco)});
            }
        }
        else{
            objAux = objAux.filter((e)=>{return e.name_cinco.indexOf(cinco) > -1});
        }
    }
        
    return objAux
}

function filtrarFaltasJson({ data, local, lotacao, nome, operacao, quadro, posto, siape, turno }) {
    let objAux = dadoFaltasJson.filter((e)=>{return e})

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
