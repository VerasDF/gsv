
let dadoJson = []
const txtFile = document.getElementById('txtFile')

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
    if(info === null){$info({msg:`Não há dados a serem processados, ocorreu algum problema.`, opt:0})}
    const parser = new DOMParser()
    let dadoBruto = []
    
    dadoBruto = parser.parseFromString(info, 'text/html')
    
    if(_testarArquivoDeOrigem('Faltas')===false){
        $info({ msg: `O arquivo não parece conter informações sobre faltas`, opt: 0 })
        return
    }

    dadoBruto = dadoBruto.querySelector(".div_form_faltas")
    dadoBruto = dadoBruto.children[0].children[0]
    
    prepararJSon(dadoBruto)
    $info({msg:`Retornados: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoJson.length)} registros`, opt:0})
    const obj = dadoJson
    //divResultado.innerHTML = JSON.stringify(obj)
    htmlConstruirTabela(obj)

    function _testarArquivoDeOrigem(itemDaBusca){
        let ret = false
        if (dadoBruto.getElementsByTagName('fieldset')) {
            const or0 = Array.from(dadoBruto.getElementsByTagName('fieldset'))
            if (or0.length > 0) {
                or0.forEach((el) => {
                    const or1 = el.children[0]
                    if (or1.innerHTML) {
                        const or2 = or1.innerHTML
                        if (or2.indexOf(itemDaBusca) > -1) {
                            ret = true
                        }
                    }
                })
            }
        }  
        return ret
    }
}

function prepararJSon(info) {
    dadoJson=[]
    for (i = 0; i < info.childElementCount; i++) {
        const obj = {}
        const tr = info.children[i]
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

            dadoJson.push(obj)
        }
    }
        
    function _sanitizar(parametro) {
        let retorno = parametro.replace("\n", "")
        retorno = retorno.replace("&nbsp;", "").trim()
        return retorno
    }
}

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

function $info({msg, opt}){
    if(opt === 1){
        labStatus.innerHTML += msg
    } else {
        labStatus.innerHTML = msg
    }
}

function htmlConstruirTabela(objDados) {
    const arrOrdemPostoGrad = ['CEL', 'TC', 'MAJ', 'CAP', '1 TEN', '2 TEN', 'ASP', 'ST', '1 SGT', '2 SGT', '3 SGT', 'CB', 'SD/1', 'SD/2']
    divResultado.innerHTML = ""
    const table = document.createElement('table')
    table.append(_cabecalho())
    let indice = 0
    for (let i = 0; i < objDados.length; i++) {
        table.append(_incluirDado(objDados[i]))
        // const objAux =  ordenarDados(filtrarDados({ posto_grad: arrOrdemPostoGrad[i] }))
        // if(objAux.length > 0){
        //     for(j = 0; j < objAux.length; j++){
        //     }
        // }
    }
    divResultado.append(table)

    function _cabecalho(){
        const tr = document.createElement('tr')
        tr.innerHTML = `` + 
        `<th class="label_th">OPERAÇÃO</th>` + 
        `<th class="label_th">LOCAL</th>` + 
        `<th class="label_th">DATA</th>` + 
        `<th class="label_th">TURNO</th>` + 
        `<th class="label_th">GRUPO</th>` + 
        `<th class="label_th">POSTO/GRAD</th>` + 
        `<th class="label_th">NOME</th>` + 
        `<th class="label_th">SIAPE</th>` + 
        `<th class="label_th">LOTAÇÃO</th>` + 
        `<th class="label_th">QUADRO</th>` + 
        `<th class="label_th">ALA</th>` + 
        `<th class="label_th">FALTA</th>`
        return tr
    }
    
    function _incluirDado(aux, i){
        const tr = document.createElement('tr')
        tr.innerHTML = `` + 
        `<td class="label_td">${aux.OPERAÇÃO}</td>` + 
        `<td class="label_td">${aux.LOCAL}</td>` + 
        `<td class="label_td">${aux.DATA}</td>` + 
        `<td class="label_td" style="white-space: nowrap;">${aux.TURNO}</td>` + 
        `<td class="label_td">${aux.GRUPO}</td>` + 
        `<td class="label_td">${aux.POSTO}</td>` + 
        `<td class="label_td">${aux.NOME}</td>` + 
        `<td class="label_td">${aux.SIAPE}</td>` + 
        `<td class="label_td">${aux.LOTAÇÃO}</td>` + 
        `<td class="label_td">${aux.QUADRO}</td>` + 
        `<td class="label_td">${aux.ALA}</td>` + 
        `<td class="label_td">${aux.FALTA}</td>`
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
    
    console.log(filtrarDados.arguments[0])

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