const $ = {
    id: function(arg){return document.getElementById(arg)},
    cn: function(arg){return document.getElementsByClassName(arg)},
    qs: function(arg){return document.querySelector(arg)},
    qsa: function(arg){return document.querySelectorAll(arg)},
    tag: function(arg){return document.getElementsByTagName(arg)}
}

conf = {
    readFile: function(input){

        carregarArquivo(input.files[0]);

        function carregarArquivo(file){
            try {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = function(){
                    conf.avaliarDadoBruto({htmlRetornado:reader.result});
                }
                reader.onerror = function(){
                    console.log(reader.error);
                }
           } catch (error) {
                console.log(error);
           }
       }
    },
    avaliarDadoBruto: function( {htmlRetornado} ){
        if(htmlRetornado === null) { throw new Error("Não retornou dados HTML para serem processados") }
        try {
            
            const parse = new DOMParser();
            const fase0 = parse.parseFromString(htmlRetornado, 'text/html');
            const fase1 = fase0.querySelector('.table_relatorio');
            const fase2 = fase1.children[0];
            const fase3 = conf.prepararEscalasJSon(fase2);

            console.log(fase3);

        } catch (error) {
            console.log(error);
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
                        objTmp['SIAPE'] = `${_sanitizar(tr.children[2].innerHTML)}`; 
                        objTmp['POSTO_GRAD'] = `${_sanitizar(tr.children[0].innerHTML)}`; 
                        objTmp['NOME'] = `${_sanitizar(tr.children[1].innerHTML)}`; 
                        objTmp['ESCALADO'] = `${_sanitizar(tr.children[1].title)}`; 
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
            return objEscala
    
        } catch (error) {
            console.log(error)
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
        function _extrairMesExtenso( dataPtBr ) {
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
        function _sanitizar(parametro) {
            let retorno = parametro.replace("\n", "");
            retorno = retorno.replace("&nbsp;", "").trim();
            return retorno;
        }
    }
}

window.onload = function() {
    $.id('fileArquivo').addEventListener('change' , (e) => {
        e.preventDefault();
        if($.id('fileArquivo').files.length > 0){
            conf.readFile($.id('fileArquivo'))
       }
   })
}