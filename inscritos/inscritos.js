
let dadoJson = []
const txtFile = document.getElementById('txtFile')
const divResultado = document.getElementById("divResultado")

txtFile.addEventListener('change',(e)=>{
    e.preventDefault()
    dadoJson=[]
    divResultado.innerHTML = ''
    let arquivo = txtFile.files
    if(arquivo.length > 0){
        $info({msg:`Tentando ler arquivo, parece conter muitos dados...`, opt:0})
        arquivo = `./${arquivo[0].name}`
        $readFile(txtFile, avaliacao)
    } else {
        $info({msg:``, opt:0})
    }
    
})

const $ajax = (arquivo, funcaoDeRetorno) => {
    const url = arquivo
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

function avaliacao(info) {
    try {
        if (info === null) { $info({ msg: `Não há dados a serem processados, ocorreu algum problema.`, opt: 0 }) }
        const parser = new DOMParser()
        let dadoBruto = []

        dadoBruto = parser.parseFromString(info, 'text/html')
        dadoBruto = dadoBruto.querySelector(".tbResumo")
        dadoBruto = dadoBruto.children[0]

        prepararJSon(dadoBruto)
        $info({ msg: `Retornados: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoJson.length)} registros`, opt: 0 })
        const obj = dadoJson
        //divResultado.innerHTML = JSON.stringify(obj)
        htmlConstruirTabela(obj)
        
        setTimeout(()=>{
            if(confirm("Deseja selecionar e copiar o resultado?")){
                Selecionar.copiar(divResultado)
            }
        },1000)

    } catch (error) {
        $info({ msg: error, opt: 0 });
        console.log(error);
    }
}

function prepararJSon(info) {
    dadoJson=[]
    for (i = 0; i < info.childElementCount; i++) {
        const obj = {}
        const tr = info.children[i]
        if (tr.children[0].nodeName === "TD") {
            obj['SIAPE'] = `${_sanitizar(tr.children[2].innerHTML)}`,
            obj['POSTO_GRAD'] = `${_sanitizar(tr.children[3].innerHTML)}`,
            obj['NOME'] = `${_sanitizar(tr.children[4].innerHTML)}`,
            obj['LOTAÇÃO'] = `${_sanitizar(tr.children[5].innerHTML)}`,
            obj['QUADRO'] = `${_sanitizar(tr.children[6].innerHTML)}`,
            obj['ALA'] = `${_sanitizar(tr.children[7].innerHTML)}`,
            dadoJson.push(obj)
        }
    }
        
    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "")
        retorno = retorno.replace("&nbsp;", "").trim()
        return retorno
    }
}

function $info({msg, opt}){
    if(opt === 1){
        labStatus.innerHTML += msg
    } else {
        labStatus.innerHTML = msg
    }
}

function htmlConstruirTabela(info) {
    const arrOrdemPostoGrad = ['CEL', 'TC', 'MAJ', 'CAP', '1 TEN', '2 TEN', 'ASP', 'ST', '1 SGT', '2 SGT', '3 SGT', 'CB', 'SD/1', 'SD/2']
    divResultado.innerHTML = ""
    const table = document.createElement('table')
    table.append(_cabecalho())
    let indice = 0
    for (let i = 0; i < arrOrdemPostoGrad.length; i++) {
        const objAux =  ordenarDados(filtrarDados({ posto_grad: arrOrdemPostoGrad[i] }))
        if(objAux.length > 0){
            for(j = 0; j < objAux.length; j++){
                table.append(_incluirDado(objAux[j], ++indice))
            }
        }
    }
    divResultado.append(table)

    function _cabecalho(){
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
}

function ordenarDados(obj){
    const aux = obj.sort(compararDados);
    return aux
    function compararDados(a, b) {
        return a.NOME - b.NOME;
    }
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

function filtrarDados({ lotacao, nome, quadro, posto_grad, siape }) {
    
    //console.log(filtrarDados.arguments[0])

    if (!lotacao) { lotacao = "" }
    if (!nome) { nome = "" }
    if (!quadro) { quadro = "" }
    if (!posto_grad) { posto_grad = "" }
    if (!siape) { siape = "" }

    return dadoJson.filter((item) => {
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

const Selecionar = {
    copiar: function (elem) {
        var body = document.body, range, sel;
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            sel = window.getSelection();
            sel.removeAllRanges();
            try {
                range.selectNodeContents(elem);
                sel.addRange(range);
            } catch (e) {
                range.selectNode(elem);
                sel.addRange(range);
            }
        } else if (body.createTextRange) {
            range = body.createTextRange();
            range.moveToElementText(elem);
            range.select();
        }
        try {
            document.execCommand('copy');
            range.blur();
        } catch (error) {
            // Exceção aqui
        }
    }
}