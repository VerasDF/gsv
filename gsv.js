const fileEscalas = document.getElementById('fileEscalas')
const fileFaltas = document.getElementById('fileFaltas')
const fileInscritos = document.getElementById('fileInscritos')

const lblEscalas = document.getElementById('lblEscalas')
const lblFaltas = document.getElementById('lblFaltas')
const lblInscritos = document.getElementById('lblInscritos')

const btnGuiaEscalas = document.getElementById('btnGuiaEscalas')
const btnGuiaFaltas = document.getElementById('btnGuiaFaltas')
const btnGuiaInscritos = document.getElementById('btnGuiaInscritos')
const btnGuiaPlanilha = document.getElementById('btnGuiaPlanilha')
const btnGuiaAvancado = document.getElementById('btnGuiaAvancado')

const radQui1 = document.getElementById('radQuinzena1')
const radQui2 = document.getElementById('radQuinzena2')
const radQui3 = document.getElementById('radQuinzena3')

const radVoluntarioCom = document.getElementById('radVoluntarioCom')
const radVoluntarioSem = document.getElementById('radVoluntarioSem')
const radVoluntarioTodos = document.getElementById('radVoluntarioTodos')
const radFaltas = document.getElementById('radFaltas')
const radCompulsorio = document.getElementById('radCompulsorio')

const selAvancadoAlterarDuracao = document.getElementById('selAvancadoAlterarDuracao')
const selEscalaGrupo = document.getElementById('selEscalaGrupo')
const selPlanilhaGrupo = document.getElementById('selPlanilhaGrupo')
const selPlanilhaOperacao = document.getElementById('selPlanilhaOperacao')
const selPlanilhaTempo = document.getElementById('selPlanilhaTempo')

const cmdAvancadoAlterar = document.getElementById('cmdAvancadoAlterar')
const cmdAvancadoExibirGrade = document.getElementById('cmdAvancadoExibirGrade')
const cmdCotaDobrada = document.getElementById('cmdCotaDobrada')
const cmdExibirEscala = document.getElementById('cmdExibirEscala')
const cmdExibirInscritos = document.getElementById('cmdExibirInscritos')
const cmdExibirPlanilha = document.getElementById('cmdExibirPlanilha')
const cmdExibirPlanilhaGrade = document.getElementById('cmdExibirPlanilhaGrade')
const cmdExportarPdf = document.getElementById('cmdExportarPdf')
const cmdFaltasPor = document.getElementById('cmdFaltasPor')
const cmdFaltasTodas = document.getElementById('cmdFaltasTodas')
const cmdPesquisarPorSiape = document.getElementById('cmdPesquisarPorSiape')
const cmdTotaisEnvolvidos = document.getElementById('cmdTotaisEnvolvidos')
const cmdTotaisEscalados = document.getElementById('cmdTotaisEscalados')

const txtAvancado = document.getElementById('txtAvancado')
const txtAvancadoAlterarValor = document.getElementById('txtAvancadoAlterarValor')

let dadoInscritosJson = []
let dadoFaltasJson = []
let dadoEscalasJson = []
let conf = {}

setTimeout(()=>{ navegarPelasGuias({}) },1)

btnGuiaAvancado.addEventListener('click', () => {
    navegarPelasGuias({ nomeDaGuia: 'Avancado' })
})

btnGuiaEscalas.addEventListener('click', () => {
    navegarPelasGuias({ nomeDaGuia: 'Escalas' })
})

btnGuiaFaltas.addEventListener('click', () => {
    navegarPelasGuias({ nomeDaGuia: 'Faltas' })
})

btnGuiaInscritos.addEventListener('click', () => {
    navegarPelasGuias({ nomeDaGuia: 'Inscritos' })
})

btnGuiaPlanilha.addEventListener('click', () => {
    navegarPelasGuias({ nomeDaGuia: 'Planilha' })
    preencherSelect(divPlanilhaGrupo, totais('GRUPO', dadoEscalasJson))
    preencherSelect(divPlanilhaOperacao, totais('OPERAÇÃO', dadoEscalasJson))
    preencherSelect(divPlanilhaTempo, totais('TEMPO', dadoEscalasJson))
})

cmdAvancadoAlterar.addEventListener('click', ()=>{
    const aux = txtAvancado.value
    if (aux===''){
        $info({msg:`(Avançado) Não há critérios para serem processados`, opt:'+n'})
        return
    }
    if(confirm('Cuidado!\n\nEsta alteração é de caráter AVANÇADO.\n\nCaso continue serão alteradas a DURAÇÃO da e o VALOR das cotas conforme filtro.\n\n Essa mudança se aplica apenas a essa seção de consulta.\n\nDeseja continuar?')){
        
        alterarDuracao(txtAvancado.value, {tempo:selAvancadoAlterarDuracao.value,valor:txtAvancadoAlterarValor.value})

    }
})

cmdAvancadoExibirGrade.addEventListener('click', (e)=>{
    try {
        
        const aux = txtAvancado.value
        if (aux===''){
            $info({msg:`(Avançado) Não há critérios para serem processados`, opt:'+n'})
            return
        }
        const par = JSON.parse(aux)
        const objAlvo = filtrarEscalasJson(par)
        $info({msg:`Filtro Avançado: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objAlvo.length)} cotas`, opt:'+n'})
        htmlConstruirGrade(objAlvo)
        
    } catch (error) {
        console.log( error )
        $info({msg:``, opt:`+a+`})
    }
})

cmdCotaDobrada.addEventListener('click', ()=>{
    cotaDobrada($('divResultado'))
})

cmdExibirEscala.addEventListener('click', (e)=>{
    e.preventDefault()

    const par = parametroEscala()
    const objAlvo = filtrarEscalasJson(par)

    // $info({msg:`Gerenciadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoEscalasJson.length)} cotas`, opt:'+n'})
    $info({msg:`Filtro: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objAlvo.length)} cotas`, opt:'+n'})

    if(objAlvo.length === 0){
        $info({msg:`A consulta não retornou dados`})
        divResultado.innerHTML = ""
    }else{
        htmlConstruirEscala(objAlvo)
        //setClipboard(divResultado) // Não está levando as bordas...
    }
})

cmdExibirInscritos.addEventListener('click', (e)=>{
    e.preventDefault()
    htmlConstruirTabelaInscritos()
})

cmdExibirPlanilha.addEventListener('click', (e)=>{
    e.preventDefault()
    const grupo = selPlanilhaGrupo.value
    const operacao = selPlanilhaOperacao.value
    const duracao = (selPlanilhaTempo.value === '12' ? '12/24' : selPlanilhaTempo.value)
    
    let par = {}
    
    par.siape = '-SV'
    if(grupo !== ''){par.grupo = grupo}
    if(operacao !== ''){par.operacao = operacao}
    if(duracao !== ''){par.tempo = duracao}

    if($('radSemFaltas').checked){
        par.falta = false
    }
    if($('radApenasFaltas').checked){
        par.falta = true
    }

    if(txtAvancado){
        txtAvancado.value = JSON.stringify(par)
    }

    const objAux = filtrarEscalasJson(par)
    
    htmlConstruirPlanilha(objAux)
})

cmdExibirPlanilhaGrade.addEventListener('click', (e)=>{
    e.preventDefault()
    const grupo = selPlanilhaGrupo.value
    const operacao = selPlanilhaOperacao.value
    const duracao = (selPlanilhaTempo.value === '12' ? '12/24' : selPlanilhaTempo.value)
    
    let par = {}
    
    par.siape = '-SV'
    if(grupo !== ''){par.grupo = grupo}
    if(operacao !== ''){par.operacao = operacao}
    if(duracao !== ''){par.tempo = duracao}

    if($('radSemFaltas').checked){
        par.falta = false
    }
    if($('radApenasFaltas').checked){
        par.falta = true
    }
    let objAux = filtrarEscalasJson(par)
    objAux = objAux.map((item)=>{return{
        "POSTO/GRAD":item.POSTO_GRAD, 
        NOME:item.NOME, 
        SIAPE:item.SIAPE, 
        DIA:item.DATA.split('/')[0], 
        VALOR:item.VALOR,
        FALTA:(item.FALTA ? `FALTOU`: ``)
    }}).sort((a,b)=>{return a.SIAPE - b.SIAPE})
    
    htmlConstruirGrade(objAux)
})

cmdExportarPdf.addEventListener('click', (e)=>{
    if (divResultado.innerHTML){
        setTimeout(()=>{
            if(confirm(`Imprimir PDF?`)) gerarPdf()
        },200)
    }else{
        $info({msg:`Não há dados a serem convertidos para PDF.`, opt:`+a`})
    }
})

cmdPesquisarPorSiape.addEventListener('click', (e)=>{
    e.preventDefault()

    const siape = txtSiape.value

    if(siape === ''){
        $info({msg:`É necessário informar uma matrícula para obter resultado!`})
        txtSiape.focus()
        return
    }

    const par = {siape:siape}
    const objAlvo = filtrarEscalasJson(par)

    // $info({msg:`Gerenciadas: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(dadoEscalasJson.length)} cotas`})
    $info({msg:`Filtrado por SIAPE: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objAlvo.length)} cotas`, opt:`+n`})

    if(objAlvo.length === 0){
        $info({msg:`A consulta não retornou dados`})
    }else{
        htmlConstruirEscala(objAlvo)
    }
})

cmdTotaisEnvolvidos.addEventListener('click', (e)=>{
    e.preventDefault()
    htmlConstruirTotalDeMilitaresEnvolvidos(filtrarEscalasJson( {siape:'-SV'} ))
})

cmdTotaisEscalados.addEventListener('click', (e)=>{
    e.preventDefault()
    htmlConstruirTotalDeMilitaresEscalados(dadoEscalasJson)
})

cmdFaltasPor.addEventListener('click', (e)=>{
    e.preventDefault()
    htmlConstuirFaltasPorDia($('selOpcaoExibirFalta').value)
})

cmdFaltasTodas.addEventListener('click', (e)=>{
    e.preventDefault()
    divResultado.innerHTML = ''
    htmlConstruirGrade(dadoFaltasJson)
})

fileEscalas.addEventListener('change', (e) => {
    e.preventDefault()
    if (fileEscalas.files.length > 0) {
        lblEscalas.innerHTML = fileEscalas.files[0].name
        $info({msg:`Escala de`,opt:`+`})
        $readFile(fileEscalas)
    }
})

fileFaltas.addEventListener('change', (e) => {
    e.preventDefault()
    if (fileFaltas.files.length > 0) {
        $info({msg:`Faltas de`,opt:`+`})
        lblFaltas.innerHTML = fileFaltas.files[0].name
        $readFile(fileFaltas)
    }
})

fileInscritos.addEventListener('change', (e) => {
    e.preventDefault()
    if (fileInscritos.files.length > 0) {
        $info({msg:`Inscritos de`,opt:`+`})
        lblInscritos.innerHTML = fileInscritos.files[0].name
        $readFile(fileInscritos)
    }
})

radQui1.addEventListener('click', (e)=>{
    dtDia.disabled = true
    preencherSelect(divEscalaGrupo, totais('GRUPO', filtrarEscalasJson({quinzena:'1ª Quinzena'})))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({quinzena:'1ª Quinzena'})))
})

radQui2.addEventListener('click', (e)=>{
    dtDia.disabled = true
    preencherSelect(divEscalaGrupo, totais('GRUPO', filtrarEscalasJson({quinzena:'2ª Quinzena'})))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({quinzena:'2ª Quinzena'})))
})

radQui3.addEventListener('change', (e)=>{
    const dtRef = new Date(`${dtDia.value}T00:00:00`)
    const dtAux = new Date(dtRef.setMonth(dtRef.getMonth()+1))
    const dtUltimoDia = new Date(dtAux.setDate(dtAux.getDate()-1))
    dtDia.min = dtDia.value
    dtDia.max = `${dtUltimoDia.getFullYear()}-${("00"+(parseInt(dtUltimoDia.getMonth())+1)).slice(-2)}-${("00" + dtUltimoDia.getDate()).slice(-2)}`
    dtDia.disabled = false
    preencherSelect(divEscalaGrupo, totais('GRUPO', filtrarEscalasJson({data:`${dtDia.value.split('-')[2]}/${dtDia.value.split('-')[1]}/${dtDia.value.split('-')[0]}`})))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({data:`${dtDia.value.split('-')[2]}/${dtDia.value.split('-')[1]}/${dtDia.value.split('-')[0]}`})))
})

selAvancadoAlterarDuracao.addEventListener('change',()=>{
    txtAvancadoAlterarValor.value = selAvancadoAlterarDuracao.value * 50
})

selEscalaGrupo.addEventListener('change', (e)=>{
    e.preventDefault()
    atualizarSelectEscala(selEscalaGrupo.value)
})

selPlanilhaGrupo.addEventListener('change', (e) => {
    e.preventDefault()
    atualizarSelectPlanilha({tag:selPlanilhaGrupo.id, grupo:selPlanilhaGrupo.value})
})

selPlanilhaOperacao.addEventListener('change', (e) => {
    e.preventDefault()
    atualizarSelectPlanilha({tag:selPlanilhaOperacao.id, grupo:selPlanilhaGrupo.value, operacao:selPlanilhaOperacao.value})
})

function parametroEscala() {
    let par = {}
    const grp = document.getElementById('selEscalaGrupo').value
    const opr = document.getElementById('selEscalaOperacao').value

    if (radQui1.checked) { par.quinzena = `1ª Quinzena`} 
    if (radQui2.checked) { par.quinzena = `2ª Quinzena`} 
    if (radQui3.checked) { par.data = `${dtDia.value.split('-')[2]}/${dtDia.value.split('-')[1]}/${dtDia.value.split('-')[0]}`} 
    if (radVoluntarioCom.checked) { par.siape = `-SV`} 
    if (radVoluntarioSem.checked) { par.siape = `SV`} 
    if (radFaltas.checked) { par.falta = true} 
    if (radCompulsorio.checked) { par.escaladoPor = 'compulsória'} 
    if (grp !== '') { par.grupo = grp} 
    if (opr !== '') { par.operacao = opr} 
    
    if(txtAvancado){
        txtAvancado.value = JSON.stringify(par)
    }
    return par
}

function inicializarEscalas() {
    $('lblEscalas').style.backgroundColor = ('var(--fundoVerde)')
    navegarPelasGuias({ nomeDaGuia: 'Escalas' })
    dtDia.value = `${dadoEscalasJson[0].DATA.split('/')[2]}-${dadoEscalasJson[0].DATA.split('/')[1]}-${dadoEscalasJson[0].DATA.split('/')[0]}`
    preencherSelect(divEscalaGrupo, totais('GRUPO', filtrarEscalasJson({quinzena:'1ª Quinzena'})))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({quinzena:'1ª Quinzena'})))
    divResultado.innerHTML = ''
    tratarFaltas()
}

function inicializarFaltas() {
    $('lblFaltas').style.backgroundColor = ('var(--fundoVerde)')
    navegarPelasGuias({ nomeDaGuia: 'Faltas' })
    divResultado.innerHTML = ''
    tratarFaltas()
}

function inicializarInscritos() {
    $('lblInscritos').style.backgroundColor = ('var(--fundoVerde)')
    navegarPelasGuias({ nomeDaGuia: 'Inscritos' })
    divResultado.innerHTML = ''
}

function navegarPelasGuias({ nomeDaGuia }) {
    _limparGuias({ nomeDaGuia })
    if (nomeDaGuia === 'Escalas') {
        btnGuiaEscalas.classList.toggle('guiaSelecionada')
        _controlesDaEscala(true)
        _controlesDaFalta(false)
        _controlesDeInscritos(false)
        _controlesDePlanilha(false)
        _controlesAvancado(false)
    }
    if (nomeDaGuia === 'Faltas') {
        btnGuiaFaltas.classList.toggle('guiaSelecionada')
        _controlesDaEscala(false)
        _controlesDaFalta(true)
        _controlesDeInscritos(false)
        _controlesDePlanilha(false)
        _controlesAvancado(false)
    }
    if (nomeDaGuia === 'Inscritos') {
        btnGuiaInscritos.classList.toggle('guiaSelecionada')
        _controlesDaEscala(false)
        _controlesDaFalta(false)
        _controlesDeInscritos(true)
        _controlesDePlanilha(false)
        _controlesAvancado(false)
    }
    if (nomeDaGuia === 'Planilha') {
        btnGuiaPlanilha.classList.toggle('guiaSelecionada')
        _controlesDaEscala(false)
        _controlesDaFalta(false)
        _controlesDeInscritos(false)
        _controlesDePlanilha(true)
        _controlesAvancado(false)
    }
    if (nomeDaGuia === 'Avancado') {
        btnGuiaAvancado.classList.toggle('guiaSelecionada')
        _controlesDaEscala(false)
        _controlesDaFalta(false)
        _controlesDeInscritos(false)
        _controlesDePlanilha(false)
        _controlesAvancado(true)
    }
    function _limparGuias({ nomeDaGuia }) {
        if(!nomeDaGuia){
            txtStatus.value = ''
            txtSiape.value = ''
            $('divGuias').style.display = 'none'
        } else {
            $('divGuias').style.display = ''
            if( dadoFaltasJson.length === 0 ) { radFaltas.disabled = true } else { radFaltas.disabled=false }
        }
        btnGuiaEscalas.disabled = (dadoEscalasJson.length > 0 ? false : true)
        btnGuiaFaltas.disabled = (dadoFaltasJson.length > 0 ? false : true)
        btnGuiaInscritos.disabled = (dadoInscritosJson.length > 0 ? false : true)
        btnGuiaPlanilha.disabled = ((dadoEscalasJson.length>0 && dadoFaltasJson.length>0) ? false : true)
        btnGuiaAvancado.disabled = (dadoEscalasJson.length>0  ? false : true)
        
        btnGuiaEscalas.className = 'guia'
        btnGuiaFaltas.className = 'guia'
        btnGuiaInscritos.className = 'guia'
        btnGuiaPlanilha.className = 'guia'
        btnGuiaAvancado.className = 'guia'
        
        $('divEscalas').style.display = (nomeDaGuia === 'Escalas' ? '' : 'none')
        $('divFaltas').style.display = (nomeDaGuia === 'Faltas' ? '' : 'none')
        $('divInscritos').style.display = (nomeDaGuia === 'Inscritos' ? '' : 'none')
        $('divPlanilha').style.display = (nomeDaGuia === 'Planilha' ? '' : 'none')
        $('divAvancado').style.display = (nomeDaGuia === 'Avancado' ? '' : 'none')
    }
    function _controlesDaEscala(comando) {
        radQui1.checked = true
        radVoluntarioCom.checked = true
        dtDia.disabled = true
        $('fldPeriodo').disabled = !comando
        $('fldConjunto').disabled = !comando
        $('fldSiape').disabled = !comando
        $('fldGrupo').disabled = !comando
        $('fldOperacao').disabled = !comando
        $('fldAcaoEscalas').disabled = !comando
    }
    function _controlesDaFalta(comando) { const qq = `não implementado${comando}`}
    function _controlesDeInscritos(comando) { const qq = `não implementado${comando}`}
    function _controlesDePlanilha(comando) { const qq = `não implementado${comando}`}
    function _controlesAvancado(comando) { const qq = `não implementado${comando}`}
}

function $info({ msg, opt }) {
    if(!opt){opt = ''}
    if (txtStatus.value === ''){opt = ''}
    
    if(opt === '+'){
        txtStatus.value += ` ${msg}`
    }
    else if (opt === ';+') {
        txtStatus.value += `; ${msg}`
    }
    else if(opt === '+n'){
        txtStatus.value += `\n${msg}`
    }
    else if(opt === '+a'){
        txtStatus.value += `\n${msg}`
        txtStatus.className = "alertar"
        setTimeout(()=>{ txtStatus.className='' },500)
    }
    else if(opt === '+a+'){
        txtStatus.className = "alertar"
        setTimeout(()=>{ txtStatus.className='' },500)
    }
    else {
        txtStatus.value = msg
    }
    txtStatus.scrollTop = txtStatus.scrollHeight
}
