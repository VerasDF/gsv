
const $ = tag => document.getElementById(tag);

const aux = {
    ajax: function ({urlDoArquivo, funcaoDeRetorno}) {
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
}

const menuOpcoes = {
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
        this._acao();
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
        this._acao();
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
        this._acao();
    },
    _acao:function(){
        const objAux = dados.filtrarEscalasJson( dados.parametros() );
        filtrar.prepararDados( objAux );
        html.atualizacaoAutomatica();
    }
}

const conf = {
    arquivoPdf: null,
    autoRefresh: null,
    mes: "",
    mesAno: "",
    totalEscalas: null,
    totalFaltas: null,
    totalInscritos: null,
    arrOrdemPostoGrad: ['CEL', 'TC', 'MAJ', 'CAP', '1 TEN', '2 TEN', 'ASP', 'ST', '1 SGT', '2 SGT', '3 SGT', 'CB', 'SD/1', 'SD/2'],
    readFile:function( input ){
        let carregado = false;
        for (let i = 0; i < input.files.length; i++) {
            if (input.files[i].name.toLowerCase().indexOf('escala') > -1){
                init.led(10);
                const file = input.files[i];
                carregarArquivo( file );
                carregado = true
            }
            if (input.files[i].name.toLowerCase().indexOf('falta') > -1){
                init.led(20);
                const file = input.files[i];
                carregarArquivo( file );
                carregado = true
            }
            if (input.files[i].name.toLowerCase().indexOf('inscrito') > -1){
                init.led(30);
                const file = input.files[i];
                carregarArquivo( file );
                carregado = true
            }
        }
    
        if(carregado == false){
            alert('O nome do arquivo não informa a forma como os dados devem ser processados!');
        }
    
        function carregarArquivo( file ){
            try {
                const reader = new FileReader();
                reader.readAsText( file );
                reader.onload = function () { init.avaliarDadoBruto({htmlRetornado:reader.result}) }
                reader.onerror = function () { console.log(reader.error) }
            } catch (error) {
                console.log(error);
            }
        }
    },
    totalStatus: function(objAux){
        $('divTotais').innerHTML = `Cotas mês: ${conf.totalEscalas.toLocaleString('pt-BR')} <br>Filtrados: ${Array.isArray(objAux) ? objAux.length.toLocaleString('pt-BR') : conf.totalEscalas.toLocaleString('pt-BR')}`;
    }
}

const init = {
    avaliarDadoBruto: function( {htmlRetornado} ) {
        try {
            if(htmlRetornado === null){ return }

            const parser = new DOMParser();
            let dadoBruto = parser.parseFromString(htmlRetornado, 'text/html');
            let funcaoAuxiliar = false;
            
            const tipoRetorno = _testarArquivoDeOrigem( dadoBruto );
            if( tipoRetorno === false ){ return }
            if( tipoRetorno === 'Escalas' ){
                dadoBruto = dadoBruto.querySelector(".table_relatorio");
                dadoBruto = dadoBruto.children[0];
                dados.escalas = init.prepararEscalasJSon( dadoBruto );
                conf.arquivoPdf = `${dados.escalas[0].DATA.split('/')[2]}-${dados.escalas[0].DATA.split('/')[1]}-${dados.escalas[0]["MÊS"]}`;
                conf.mesAno = `${dados.escalas[0]["MÊS"]}/${dados.escalas[0].DATA.split('/')[2]}`;
                conf.totalEscalas = dados.escalas.length;
                funcaoAuxiliar = init.inicializarInterfaceDeEscalas;
            }
            if( tipoRetorno === 'Faltas' ){
                dadoBruto = dadoBruto.querySelector(".div_form_faltas");
                dadoBruto = dadoBruto.children[0].children[0];
                dados.faltas = init.prepararFaltasJSon( dadoBruto );
                conf.totalFaltas = dados.faltas.length;
                funcaoAuxiliar = init.inicializarInterfaceDeFaltas;
            }
            if( tipoRetorno === 'Inscritos' ){
                dadoBruto = dadoBruto.querySelector(".tbResumo");
                dados.inscritos = init.prepararInscritosJSon( dadoBruto );
                conf.totalInscritos = dados.inscritos.length;
            }
            if(funcaoAuxiliar){ funcaoAuxiliar() }
    
            function _testarArquivoDeOrigem( dadoBruto ){
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
            conf.autoRefresh = true;
            conf.totalStatus();
        } catch (error) {
            console.log(error)
        }
    },
    inicializarInterfaceDeEscalas: function(){
        init.carregarControles();
    },
    inicializarInterfaceDeFaltas: function(){
        if(dados.escalas.length==0){
            setTimeout(() => {
                init.inicializarInterfaceDeFaltas();
            }, 200);
            console.log('Os dados de escala não foram carregados completamente...');
            return;
        }
        else{
            setTimeout(() => {
                init.tratarFaltas();
            }, 200);
        }
    },
    prepararEscalasJSon: function( dadosHtml ) {
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
                        objTmp['MÊS'] = init.extrairMesExtenso(opr.name_tres);
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
            init.led(12);
            return objEscala
    
        } catch (error) {
            init.led(11);
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
            const aux = _sanitizar(parametro);
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
    },
    prepararFaltasJSon: function( dadosHtml ){
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
    
        init.led(22);
        return objFalta;
            
        function _sanitizar(parametro) {
            let retorno = parametro.replace("\n", "");
            retorno = retorno.replace("&nbsp;", "").trim();
            retorno = retorno.replace(" À ", " ÀS ").replace(" à ", " às ");
            return retorno;
        }
    },
    prepararInscritosJSon: function( dadoHtml ){
        let objTmp = []
    
        if(dadoHtml.children[0].children[0].bgColor == "#DDD"){
            dadoHtml = dadoHtml.children[1]
            _versao2();
        } else {
            dadoHtml = dadoHtml.children[0]
            _versao1();
        }
        
        init.led(32);
        return objTmp;
        
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
    },
    extrairMesExtenso: function( dataPtBr ) {
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
    },
    led: function( cod ) {
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
    },
    tratarFaltas: function() {

        if(dados.escalas.length===0 || dados.faltas.length===0){ return }
        
        if(dados.escalas[0].DATA.split("/")[1] !== dados.faltas[0].DATA.split("/")[1])
        {
            alert(`Períodos incompatívies para tratar faltas`);
            return;
        }
        
        let contador = 0;
        dados.escalas.forEach((elm)=>{
            const filtroTurno = dados.filtrarFaltasJson({siape:elm.SIAPE, data:elm.DATA, turno:elm.HORA});
            if(filtroTurno.length > 0){
                elm.ASSINATURA = 'FALTOU';
                elm.FALTA = true;
                contador = contador + 1;
            }
        })
        
        if(dados.faltas.length != contador){
            conf.led(21);
        }
        conf.faltaStatus = `faltas: ${dados.faltas.length}/${contador}`;
    
        dados.faltas.forEach((flt)=>{
            const filtroFalta = filtrarEscalasJson({siape:flt.SIAPE, data:flt.DATA, horario:flt.TURNO});
            if (filtroFalta.length == 0){
                console.log("(Falta não aplicada)", flt.SIAPE, flt.DATA, flt.TURNO,flt.LOCAL, flt.OPERAÇÃO);
            }
        })
    },
    carregarControles: function(){
        init.carregarDataDoMes();
        init.carregarDuracao();
        init.carregarFuncao();
        init.carregarGbmDestino();
        init.carregarGrupo();
        init.carregarOperacao();
        init.carregarQuadro();
        init.carregarTurno();
        conf.totalStatus();
        setTimeout(() => {
            filtrar.prepararDados(dados.filtrarEscalasJson(dados.parametros()));
        }, 500);
    },
    carregarDataDoMes: function(){
        init._criarCalendarioDoMes();
    },
    carregarGrupo: function(){
        const arrGrupo = dados.escalas.map((item)=>`${item.GRUPO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divGrupo = $('divFiltroGrupo');
        init._limparLista(divGrupo);
        for(let i = 0; i < arrGrupo.length; i++){
            divGrupo.append(init._criarItemDaLista(divGrupo, arrGrupo[i]));
        }
        $('fldGrupo').children[0].innerHTML = `Grupos: (${arrGrupo.length})`;
    },
    carregarDuracao: function(){
        const arrDuracao = dados.escalas.map((item)=>`${item.TEMPO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divDuracao = $('divFiltroDuracao');
        $('fldDuracao').children[0].innerHTML = `Duração: (${arrDuracao.length})`;
        init._limparLista(divDuracao);
        for(let i = 0; i < arrDuracao.length; i++){
            divDuracao.append(init._criarItemDaLista(divDuracao, arrDuracao[i]));
        }
    },
    carregarOperacao: function(){
        const arrOperacao = dados.escalas.map((item)=>`${item.OPERAÇÃO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divOperacao = $('divFiltroOperacao');
        init._limparLista(divOperacao);
        for(let i = 0; i < arrOperacao.length; i++){
            divOperacao.append(init._criarItemDaLista(divOperacao, arrOperacao[i]));
        }
        $('fldOperacao').children[0].innerHTML = `Operações: (${arrOperacao.length})`;
    },
    carregarGbmDestino: function(){
        const arrGbmDestino = dados.escalas.map((item)=>`${item.GBM_DESTINO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        let arrAux = arrGbmDestino;
        const divGbmDestino = $('divFiltroGbmDestino');
        init._limparLista(divGbmDestino);
        for(let i = 0; i < arrGbmDestino.length; i++){
            arrAux = arrAux.sort(ordenar.porGBM);
            divGbmDestino.append(init._criarItemDaLista(divGbmDestino, arrAux[i]));
        }
        $('fldGbmDestino').children[0].innerHTML = `Destino: (${arrGbmDestino.length})`;
    },
    carregarTurno: function(){
        const arrTurno = dados.escalas.map((item)=>`${item.HORA}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divTurno = $('divFiltroTurno');
        init._limparLista(divTurno);
        for(let i = 0; i < arrTurno.length; i++){
            divTurno.append(init._criarItemDaLista(divTurno, arrTurno[i]));
        }
        $('fldTurno').children[0].innerHTML = `Turnos: (${arrTurno.length})`;
    },
    carregarQuadro: function(){
        const arrQuadro = dados.escalas.map((item)=>`${item.QUADRO}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divQuadro = $('divFiltroQuadro');
        init._limparLista(divQuadro);
        for(let i = 0; i < arrQuadro.length; i++){
            divQuadro.append(init._criarItemDaLista(divQuadro, arrQuadro[i]));
        }
        $('fldQuadro').children[0].innerHTML = `Quadros: (${arrQuadro.length})`;
    },
    carregarFuncao: function(){
        const arrFuncao = dados.escalas.map((item)=>`${item.name_cinco}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        const divFuncao = $('divFiltroFuncao');
        init._limparLista(divFuncao);
        for(let i = 0; i< arrFuncao.length; i++){
            divFuncao.append(init._criarItemDaLista(divFuncao, arrFuncao[i]));
        }
        $('fldFuncao').children[0].innerHTML = `Funções: (${arrFuncao.length})`;
    },
    tratarFaltas: function() {
        if(dados.escalas.length===0 || dados.faltas.length===0){ return }
        
        if(dados.escalas[0].DATA.split("/")[1] !== dados.faltas[0].DATA.split("/")[1])
        {
            alert(`Períodos incompatívies para tratar faltas`);
            return;
        }
        
        let contador = 0;
        dados.escalas.forEach((elm)=>{
            const filtroTurno = dados.filtrarFaltasJson({siape:elm.SIAPE, data:elm.DATA, turno:elm.HORA});
            if(filtroTurno.length > 0){
                elm.ASSINATURA = 'FALTOU';
                elm.FALTA = true;
                contador = contador + 1;
            }
        })
        
        if(dados.faltas.length != contador){
            $led(21);
        }
        $('divStatusFalta').title = `Processametno de faltas: ${dados.faltas.length}/${contador}`;
    
        dados.faltas.forEach((flt)=>{
            const filtroFalta = dados.filtrarEscalasJson({siape:flt.SIAPE, data:flt.DATA, horario:flt.TURNO});
            if (filtroFalta.length == 0){
                console.log("(Falta não aplicada)", flt.SIAPE, flt.DATA, flt.TURNO,flt.LOCAL, flt.OPERAÇÃO);
            }
        })
    },
    _criarItemDaLista: function(objTag, strTexto){
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
    _criarCalendarioDoMes: function(){
        const arrDias = dados.escalas[0].DATA;
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
    _limparLista: function(ctrAux){
        for(let i = ctrAux.childElementCount-1; i >= 0; i--){
            if(ctrAux.children[i].nodeName.toLowerCase() == 'button'){
                ctrAux.removeChild(ctrAux.children[i]);
            }
        }
    }
}

const ordenar = {
    porData: function(a, b){
        if(a.DATA == b.DATA){
            return 0;
        }
        if(a.DATA < b.DATA){
            return -1;
        }
        if(a.DATA > b.DATA){
            return 1;
        }
    },
    porGBM: function(a, b) {
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
    },
    porPostoGrad: function(indice){
    
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
    },
    tabela: function(indice){
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
}

const dados = {
    escalas: [],
    faltas: [],
    inscritos: [],
    parametros: function(foco){
        const _divFiltroDurcao = $('divFiltroDuracao');
        const _divFaltaOpcao = $('divFaltaOpcao');
        const _divFiltroFuncao = $('divFiltroFuncao');
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
        let arrFuncao = [];
        let arrGrupo = [];
        let arrOper = [];
        let arrGbmDestino = [];
        let arrTurno = [];
        let arrQuadro = [];
        let arrData = [];
        let arrSiape = [];
        let arrQuinzena = [];
        
        if(foco == undefined || foco == `duracao`){ arrDuracao = _buscarSelecionados( _divFiltroDurcao) }
        if(foco == undefined || foco == `falta`){ arrFalta = _buscarSelecionados( _divFaltaOpcao) }
        if(foco == undefined || foco == `grupo`){ arrGrupo = _buscarSelecionados( _divFiltroGrupo) }
        if(foco == undefined || foco == `operacao`){ arrOper = _buscarSelecionados( _divFiltroOperacao) }
        if(foco == undefined || foco == `gbm_destino`){ arrGbmDestino = _buscarSelecionados( _divFiltroGbmDestino) }
        if(foco == undefined || foco == `turno`){ arrTurno = _buscarSelecionados( _divFiltroTurno) }
        if(foco == undefined || foco == `quadro`){ arrQuadro = _buscarSelecionados( _divFiltroQuadro) }
        if(foco == undefined || foco == `funcao`){ arrFuncao = _buscarSelecionados( _divFiltroFuncao) }
        if(foco == undefined || foco == `data`){ arrData = _buscarSelecionados( _divCalendario) }
        if(foco == undefined || foco == `opcao`){ arrSiape = _buscarSelecionados( _filtroOpcao) }
        if(foco == undefined || foco == `quinzena`){ arrQuinzena = _buscarSelecionados( _quinzenaOpcao) }
        
        if(arrDuracao.length > 0) { par.tempo = arrDuracao}
        if(arrFalta.length > 0) { par.falta = arrFalta}
        if(arrGrupo.length > 0) { par.grupo = arrGrupo}
        if(arrOper.length > 0) { par.operacao = arrOper }
        if(arrGbmDestino.length > 0) { par.gbm_destino = arrGbmDestino }
        if(arrTurno.length > 0) { par.horario = arrTurno }
        if(arrQuadro.length > 0) { par.quadro = arrQuadro }
        if(arrFuncao.length > 0) { par.cinco = arrFuncao}
        if(arrData.length > 0) { par.data = arrData }
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
    
        conf.paramJson = JSON.stringify(par);
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
    },
    filtrarEscalasJson: function({ assinatura, data, escaladoPor, falta, grupo, gbm_destino, horario, lotacao, nome, operacao, operacao_tipo, quadro, quinzena, posto_grad, siape, sub_lotacao_local, tempo, cinco }) {
    
        let objAux = dados.escalas.filter((e)=>{return e})
    
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
    },
    filtrarFaltasJson: function({ data, local, lotacao, nome, operacao, quadro, posto, siape, turno }) {
        let objAux = dados.faltas.filter((e)=>{return e})
    
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
        
    },
    filtrarInscritosJson: function({ cursos, lotacao, nome, quadro, posto_grad, siape }) {
        
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
}

const filtrar = {
    processarClickDoBotao:function(botao){
        if ( botao.id.indexOf('btnDiaDoMes') > -1 ) {
            const objAux = dados.filtrarEscalasJson(dados.parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroDuracaoBtn' ) {
            const objAux = dados.filtrarEscalasJson(dados.parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id = 'divFiltroFuncaoBtn' ){
            const objAux = dados.filtrarEscalasJson(dados.parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroGbmDestinoBtn' ) {
            const objAux = dados.filtrarEscalasJson(dados.parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroGrupoBtn' ) {
            const objAux = dados.filtrarEscalasJson(dados.parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroOperacaoBtn' ) {
            const objAux = dados.filtrarEscalasJson(dados.parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id.indexOf('divFiltroQuadroBtn') > -1 ) {
            const objAux = dados.filtrarEscalasJson(dados.parametros());
            filtrar.prepararDados(objAux);
        }
        if ( botao.id == 'divFiltroTurnoBtn' ) {
            const objAux = dados.filtrarEscalasJson(dados.parametros());
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
        filtrar.destacarFuncao(objAux);
        filtrar.destacarDatas(objAux);
        conf.totalStatus(objAux);
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
    destacarFuncao:function(objAux){
        const arrFuncao = objAux.map((item)=> `${item.name_cinco}`).filter((elem, index, arr)=>arr.indexOf(elem) === index).sort((a, b)=>{return a.localeCompare(b)});
        filtrar.destacar(arrFuncao, $('divFiltroFuncao'));
        $('fldFuncao').children[0].innerHTML = `Funções: (${arrFuncao.length})`;
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
    atualizacaoAutomatica: function(){

    }
}

window.onload = function(){
    $('fileArquivo').addEventListener('change', (e)=>{
        e.preventDefault();
        if($('fileArquivo').files.length > 0){
            conf.readFile($('fileArquivo'));
        }
    })
    
    //opções
    $('btnOpcaoTodas').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.cota(e.target);
    })
    $('btnOpcaoComVoluntario').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.cota(e.target);
    })
    $('btnOpcaoSemVoluntario').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.cota(e.target);
    })
    $('btnOpcaoCompulsorio').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.cota(e.target);
    })
    
    //falta
    $('btnFaltaTodas').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.falta(e.target);
    })
    $('btnFaltaFalse').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.falta(e.target);
    })
    $('btnFaltaTrue').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.falta(e.target);
    })
    
    //quinzena
    $('btnQuinzenaMesInteiro').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.quinzena(e.target);
    })
    $('btnQuinzena1').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.quinzena(e.target);
    })
    $('btnQuinzena2').addEventListener('click', (e)=>{
        e.preventDefault();
        menuOpcoes.quinzena(e.target);
    })
    
}








