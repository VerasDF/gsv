const fileEscalas = document.getElementById('fileEscalas')
const fileFaltas = document.getElementById('fileFaltas')
const fileInscritos = document.getElementById('fileInscritos')

const fldConjunto = document.getElementById("fldConjunto") 

const lblEscalas = document.getElementById('lblEscalas')
const lblFaltas = document.getElementById('lblFaltas')
const lblInscritos = document.getElementById('lblInscritos')

const btnGuiaEscalas = document.getElementById('btnGuiaEscalas')
const btnGuiaFaltas = document.getElementById('btnGuiaFaltas')
const btnGuiaInscritos = document.getElementById('btnGuiaInscritos')
const btnGuiaPlanilha = document.getElementById('btnGuiaPlanilha')
const btnGuiaAvancado = document.getElementById('btnGuiaAvancado')

const chkFaltas = document.getElementById('chkFaltas')

const dtDia = document.getElementById('dtDia')

const radQui0 = document.getElementById('radQuinzena0')
const radQui1 = document.getElementById('radQuinzena1')
const radQui2 = document.getElementById('radQuinzena2')
const radQui3 = document.getElementById('radQuinzena3')

const radVoluntarioTodos = document.getElementById('radVoluntarioTodos')
const radVoluntarioCom = document.getElementById('radVoluntarioCom')
const radVoluntarioSem = document.getElementById('radVoluntarioSem')
const radCompulsorio = document.getElementById('radCompulsorio')

const selAvancadoAlterarDuracao = document.getElementById('selAvancadoAlterarDuracao')
const selEscalaFalta = document.getElementById('selEscalaFalta')
const selEscalaGbmDestino = document.getElementById('selEscalaGbmDestino')
const selEscalaGrupo = document.getElementById('selEscalaGrupo')
const selEscalaHorario = document.getElementById('selEscalaHorario')
const selEscalaOperacao = document.getElementById('selEscalaOperacao')
const selFaltaOperacao = document.getElementById('selFaltaOperacao')
const selPlanilhaGrupo = document.getElementById('selPlanilhaGrupo')
const selOpcaoExibirFalta = document.getElementById('selOpcaoExibirFalta')
const selPlanilhaOperacao = document.getElementById('selPlanilhaOperacao')
const selPlanilhaTempo = document.getElementById('selPlanilhaTempo')

const cmdAvancadoAlterar = document.getElementById('cmdAvancadoAlterar')
const cmdAvancadoExibirGrade = document.getElementById('cmdAvancadoExibirGrade')
const cmdCotaDobrada = document.getElementById('cmdCotaDobrada')
const cmdExibirEscala = document.getElementById('cmdExibirEscala')
const cmdExibirInscritos = document.getElementById('cmdExibirInscritos')
const cmdExibirPlanilha = document.getElementById('cmdExibirPlanilha')
const cmdExibirPlanilhaGrade = document.getElementById('cmdExibirPlanilhaGrade')
const cmdExibirFaltas = document.getElementById('cmdExibirFaltas')
const cmdFiltrarCursos = document.getElementById('cmdFiltrarCursos')
const cmdPesquisarPorSiape = document.getElementById('cmdPesquisarPorSiape')
const cmdTotaisEnvolvidos = document.getElementById('cmdTotaisEnvolvidos')
const cmdTotaisEscalados = document.getElementById('cmdTotaisEscalados')

const txtAvancado = document.getElementById('txtAvancado')
const txtAvancadoAlterarValor = document.getElementById('txtAvancadoAlterarValor')
const txtCursos = document.getElementById('txtCursos')
const txtSiape = document.getElementById('txtSiape')
const txtStatus = document.getElementById('txtStatus')

let dadoEscalasJson = []
let dadoFaltasJson = []
let dadoInscritosJson = []
let conf = {}

setTimeout(()=>{ navegarPelasGuias({}) },5)

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
    if(confirm('C U I D A D O!\n\nEsta alteração é de caráter AVANÇADO.\n\nPoderão ser alterados a DURAÇÃO e o VALOR das cotas conforme filtro informado.\n\n Essa mudança se aplica apenas a essa seção de consulta de dados em memória RAM.\n\nDeseja continuar?')){
        alterarDuracao(txtAvancado.value, {tempo:selAvancadoAlterarDuracao.value, valor:txtAvancadoAlterarValor.value})
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
                
        switch ($('selTipoDeGrade').value) {
            case '1':
                htmlConstruirEscala(objAlvo)
                break;
            case '2':
                htmlConstruirPlanilha(objAlvo)
                break;
            case '3':
                htmlConstruirTotalDeMilitaresEscalados(objAlvo)
                break;
            case '4':
                htmlConstruirTotalDeCotasPorData(objAlvo)
                break;
            case '5':
                htmlConstruirTotaisPorDiasCotasOficiaisPraças(objAlvo)
                break;
            default:
                htmlConstruirGrade(objAlvo)
                break;
        }
        txtAvancado.value = aux
        
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

    $info({msg:`Filtro aplicado: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objAlvo.length)} cotas gerenciadas`, opt:'+n'})
    
    if(objAlvo.length === 0){
        $info({msg:`A consulta não retornou dados`})
        divResultado.innerHTML = ""
    }else{
        htmlConstruirEscala(objAlvo)
        //setClipboard(divResultado) // Não está levando as bordas...
    }
})

cmdExibirFaltas.addEventListener('click', (e)=>{
    e.preventDefault()
    divResultado.innerHTML = ''
    const objAlvo = filtrarFaltasJson(parametroFalta())
    
    $info({msg:`Filtro aplicado: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objAlvo.length)} cotas gerenciadas`, opt:'+n'})
    
    if(objAlvo.length === 0){
        $info({msg:`A consulta não retornou dados`})
        divResultado.innerHTML = ""
    }else{
        htmlConstruirGrade(objAlvo)
    }
})

cmdExibirInscritos.addEventListener('click', (e)=>{
    e.preventDefault()
    htmlConstruirTabelaInscritos()
})

cmdExibirPlanilha.addEventListener('click', (e)=>{
    e.preventDefault()
    htmlConstruirPlanilha()
})

cmdExibirPlanilhaGrade.addEventListener('click', (e)=>{
    e.preventDefault()
    let par = parametroPlanilha()
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

cmdPesquisarPorSiape.addEventListener('click', (e)=>{
    e.preventDefault()

    const siape = txtSiape.value

    if(siape === ''){
        $info({msg:`É necessário informar uma matrícula para obter resultado!`, opt:`+a+`})
        txtSiape.focus()
        return
    }

    const par = {siape:siape}
    const objAlvo = filtrarEscalasJson(par)

    $info({msg:`Filtrado por SIAPE: ${Intl.NumberFormat('pr-BR', { maximumSignificantDigits: 5 }).format(objAlvo.length)} cotas`, opt:`+n`})

    if(txtAvancado){
        txtAvancado.value = JSON.stringify(par)
    }

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
    let par = parametroEscala()
    const objAlvo = filtrarEscalasJson(par)
    htmlConstruirTotalDeMilitaresEscalados(objAlvo)
})

fileEscalas.addEventListener('change', (e) => {
    e.preventDefault()
    if (fileEscalas.files.length > 0) {
        lblEscalas.innerHTML = fileEscalas.files[0].name
        $readFile(fileEscalas)
        parametroEscala()
    }
})
fileFaltas.addEventListener('change', (e) => {
    e.preventDefault()
    if (fileFaltas.files.length > 0) {
        lblFaltas.innerHTML = fileFaltas.files[0].name
        $readFile(fileFaltas)
    }
})
fileInscritos.addEventListener('change', (e) => {
    e.preventDefault()
    if (fileInscritos.files.length > 0) {
        $('divResultado').innerHTML=''
        lblInscritos.innerHTML = fileInscritos.files[0].name
        $readFile(fileInscritos)
    }
})
fldConjunto.addEventListener('click', (e)=>{
    atualizarSelectEscala(selEscalaGrupo.value)
})

radQui0.addEventListener('click', (e)=>{
    dtDia.disabled = true
    preencherSelect(divEscalaGrupo, totais('GRUPO', dadoEscalasJson))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', dadoEscalasJson))
    preencherSelect(divEscalaHorario, totais('HORA', dadoEscalasJson))
    preencherSelect(divEscalaGbmDestino, totais('GBM_DESTINO', dadoEscalasJson))
    parametroEscala()
})
radQui1.addEventListener('click', (e)=>{
    dtDia.disabled = true
    preencherSelect(divEscalaGrupo, totais('GRUPO', filtrarEscalasJson({quinzena:'1ª Quinzena'})))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({quinzena:'1ª Quinzena'})))
    preencherSelect(divEscalaHorario, totais('HORA', filtrarEscalasJson({quinzena:'1ª Quinzena'})))
    preencherSelect(divEscalaGbmDestino, totais('GBM_DESTINO', filtrarEscalasJson({quinzena:'1ª Quinzena'})))
    parametroEscala()
})
radQui2.addEventListener('click', (e)=>{
    dtDia.disabled = true
    preencherSelect(divEscalaGrupo, totais('GRUPO', filtrarEscalasJson({quinzena:'2ª Quinzena'})))
    preencherSelect(divEscalaGbmDestino, totais('GBM_DESTINO', filtrarEscalasJson({quinzena:'2ª Quinzena'})))
    preencherSelect(divEscalaHorario, totais('HORA', filtrarEscalasJson({quinzena:'2ª Quinzena'})))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson({quinzena:'2ª Quinzena'})))
    parametroEscala()
})
radQui3.addEventListener('change', (e)=>{
    dtDia.disabled = false

    const par = {data:`${dtDia.value.split('-')[2]}/${dtDia.value.split('-')[1]}/${dtDia.value.split('-')[0]}`}
    
    preencherSelect(divEscalaGrupo, totais('GRUPO', filtrarEscalasJson(par)))
    preencherSelect(divEscalaGbmDestino, totais('GBM_DESTINO', filtrarEscalasJson(par)))
    preencherSelect(divEscalaHorario, totais('HORA', filtrarEscalasJson(par)))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', filtrarEscalasJson(par)))
    parametroEscala()
})

radVoluntarioTodos.addEventListener('change', (e)=> {
    parametroEscala()
})
radVoluntarioCom.addEventListener('change', (e)=> {
    parametroEscala()
})
radVoluntarioSem.addEventListener('change', (e)=> {
    parametroEscala()
})
radCompulsorio.addEventListener('change', (e)=> {
    parametroEscala()
})

selAvancadoAlterarDuracao.addEventListener('change',()=>{
    txtAvancadoAlterarValor.value = selAvancadoAlterarDuracao.value * 50
})
selEscalaGbmDestino.addEventListener('change', (e)=>{
    e.preventDefault()
    parametroEscala()
})
selEscalaGrupo.addEventListener('change', (e)=>{
    e.preventDefault()
    atualizarSelectEscala(selEscalaGrupo.value)
    parametroEscala()
})
selEscalaHorario.addEventListener('change', (e)=>{
    e.preventDefault()
    parametroEscala()
})
selEscalaOperacao.addEventListener('change', (e)=>{
    e.preventDefault()
    parametroEscala()
})
selFaltaOperacao.addEventListener('change', (e) => {
    e.preventDefault()
    let contarOperacao = 0
    for(let i = 0; i < selFaltaOperacao.options.length; i++){
        if(selFaltaOperacao.options[i].selected){ contarOperacao = contarOperacao + 1 }
    }
    $('fldFaltaOperacao').children[0].innerHTML = `Opções para Operação (${contarOperacao} selecionados)`
    if(contarOperacao>9){
        alert("A lógica implementada tem capacidade de processar até 10 itens selecionados!")
    }
    parametroEscala()
})
selOpcaoExibirFalta.addEventListener('change', (e)=>{
    e.preventDefault()
    htmlConstuirFaltasPorDia($('selOpcaoExibirFalta').value)
})
selPlanilhaGrupo.addEventListener('change', (e) => {
    e.preventDefault()
    atualizarSelectPlanilha({tag:selPlanilhaGrupo.id, grupo:selPlanilhaGrupo.value})
})
selPlanilhaOperacao.addEventListener('change', (e) => {
    e.preventDefault()
    let contarOperacao = 0
    for(let i = 0; i < selPlanilhaOperacao.options.length; i++){
        if(selPlanilhaOperacao.options[i].selected){ contarOperacao = contarOperacao + 1 }
    }
    $('fldPlanilhaOperacao').children[0].innerHTML = `Opções para Operação (${contarOperacao} selecionados)`
    if(contarOperacao>9){
        alert("A lógica implementada tem capacidade de processar até 10 itens selecionados!")
    }
})

txtSiape.addEventListener('keydown',(e)=>{
    if(e.key === "Enter"){
        cmdPesquisarPorSiape.click()
        txtSiape.select()
    }
})

function parametroEscala() {
    
    let par = {}
    
    const grp = document.getElementById('selEscalaGrupo').value
    const opr = document.getElementById('selEscalaOperacao').value
    const hor = document.getElementById('selEscalaHorario').value
    const gbmDestino = document.getElementById('selEscalaGbmDestino').value

    if ( radQui1.checked ) { par.quinzena = `1ª Quinzena` } 
    if ( radQui2.checked ) { par.quinzena = `2ª Quinzena` } 
    if ( radQui3.checked ) { par.data = `${dtDia.value.split('-')[2]}/${dtDia.value.split('-')[1]}/${dtDia.value.split('-')[0]}` } 
    if ( radVoluntarioCom.checked ) { par.siape = `-SV` } 
    if ( radVoluntarioSem.checked ) { par.siape = `SV` } 
    if ( chkFaltas.checked ) { par.falta = (selEscalaFalta.value === "true" ? true: (selEscalaFalta.value === "false" ? false : ""))} 
    if ( radCompulsorio.checked ) { par.escaladoPor = 'compulsória' } 
    if ( grp !== '' ) { par.grupo = grp } 
    if ( opr !== '' ) { par.operacao = opr } 
    if ( hor !== '' ) { par.horario = hor } 
    if ( gbmDestino !== '' ) { par.gbm_destino = gbmDestino } 
    if ( txtAvancado ) { txtAvancado.value = JSON.stringify(par) }

    return par
}

function parametroFalta(){
    let par = {}
    let arrOper = []
    for(let i = 0; i < selFaltaOperacao.options.length; i++){
        if(selFaltaOperacao.options[i].selected){
            arrOper.push(`${selFaltaOperacao.options[i].value}`)
        }
    }
    if (arrOper.length > 0) { par.operacao = arrOper} 
    return par
}

function parametroPlanilha() {
    const grupo = selPlanilhaGrupo.value
    const duracao = (selPlanilhaTempo.value === '12' ? '12/24' : selPlanilhaTempo.value)

    let par = {}
    let arrOper = []
    for(let i = 0; i < selPlanilhaOperacao.options.length; i++){
        if(selPlanilhaOperacao.options[i].selected){
            arrOper.push(`${selPlanilhaOperacao.options[i].value}`)
        }
    }
    par.siape = '-SV'
    if (grupo !== '') { par.grupo = grupo} 
    if (arrOper !== '') { par.operacao = arrOper} 
    if (duracao !== '') { par.tempo = duracao} 

    if ($('radSemFaltas').checked) { par.falta = false }
    if ($('radApenasFaltas').checked) { par.falta = true }
    if(txtAvancado){
        txtAvancado.value = JSON.stringify(par)
    }
    return par
}

function inicializarEscalas() {
    $('lblEscalas').style.backgroundColor = ('var(--fundoVerde)')
    navegarPelasGuias({ nomeDaGuia: 'Escalas' })
    dtDia.value = `${dadoEscalasJson[0].DATA.split('/')[2]}-${dadoEscalasJson[0].DATA.split('/')[1]}-${dadoEscalasJson[0].DATA.split('/')[0]}`
    _apenasMesVigente()
    preencherSelect(divEscalaGrupo, totais('GRUPO', dadoEscalasJson))
    preencherSelect(divEscalaGbmDestino, totais('GBM_DESTINO', dadoEscalasJson))
    preencherSelect(divEscalaHorario, totais('HORA', dadoEscalasJson))
    preencherSelect(divEscalaOperacao, totais('OPERAÇÃO', dadoEscalasJson))
    divResultado.innerHTML = ''
    tratarFaltas()

    function _apenasMesVigente(){
        const dtRef = new Date(`${dtDia.value}T00:00:00`)
        const dtRefMonthPlus = new Date(dtRef.setMonth(dtRef.getMonth()+1))
        const dtRefDayFirst = new Date(dtRefMonthPlus.setDate(1))
        const dtUltimoDia = new Date(dtRefDayFirst.setDate(dtRefDayFirst.getDate()-1))
        dtDia.min = dtDia.value
        dtDia.max = `${dtUltimoDia.getFullYear()}-${("00"+(parseInt(dtUltimoDia.getMonth())+1)).slice(-2)}-${("00" + dtUltimoDia.getDate()).slice(-2)}`
    }
}

function inicializarFaltas() {
    $('lblFaltas').style.backgroundColor = ('var(--fundoVerde)')
    navegarPelasGuias({ nomeDaGuia: 'Faltas' });
    preencherSelect(divFaltaOperacao, totais('OPERAÇÃO', dadoFaltasJson));
    divResultado.innerHTML = '';
    tratarFaltas();
}

function inicializarInscritos() {
    $('lblInscritos').style.backgroundColor = ('var(--fundoVerde)')
    navegarPelasGuias({ nomeDaGuia: 'Inscritos' })
    divResultado.innerHTML = ''
}

function navegarPelasGuias({ nomeDaGuia }) {
    _limparGuias({ nomeDaGuia })
    if (nomeDaGuia === 'Escalas') {
        btnGuiaEscalas.classList.toggle('btnDeGuiaSelecionado')
        _controlesDaEscala(true)
        _controlesDaFalta(false)
        _controlesDeInscritos(false)
        _controlesDePlanilha(false)
        _controlesAvancado(false)
    }
    if (nomeDaGuia === 'Faltas') {
        btnGuiaFaltas.classList.toggle('btnDeGuiaSelecionado')
        _controlesDaEscala(false)
        _controlesDaFalta(true)
        _controlesDeInscritos(false)
        _controlesDePlanilha(false)
        _controlesAvancado(false)
    }
    if (nomeDaGuia === 'Inscritos') {
        btnGuiaInscritos.classList.toggle('btnDeGuiaSelecionado')
        _controlesDaEscala(false)
        _controlesDaFalta(false)
        _controlesDeInscritos(true)
        _controlesDePlanilha(false)
        _controlesAvancado(false)
    }
    if (nomeDaGuia === 'Planilha') {
        btnGuiaPlanilha.classList.toggle('btnDeGuiaSelecionado')
        _controlesDaEscala(false)
        _controlesDaFalta(false)
        _controlesDeInscritos(false)
        _controlesDePlanilha(true)
        _controlesAvancado(false)
    }
    if (nomeDaGuia === 'Avancado') {
        btnGuiaAvancado.classList.toggle('btnDeGuiaSelecionado')
        _controlesDaEscala(false)
        _controlesDaFalta(false)
        _controlesDeInscritos(false)
        _controlesDePlanilha(false)
        _controlesAvancado(true)
    }
    function _limparGuias({ nomeDaGuia }) {
        const te = dadoEscalasJson.length
        const tf = dadoFaltasJson.length
        const ti = dadoInscritosJson.length

        btnGuiaEscalas.className = 'btnDeGuia'
        btnGuiaFaltas.className = 'btnDeGuia'
        btnGuiaInscritos.className = 'btnDeGuia'
        btnGuiaPlanilha.className = 'btnDeGuia'
        btnGuiaAvancado.className = 'btnDeGuia'
        
        if ( te > 0 ){
            btnGuiaEscalas.disabled = false
            btnGuiaAvancado.disabled = false
            btnGuiaPlanilha.disabled = false
        } else {
            btnGuiaEscalas.disabled = true
            btnGuiaAvancado.disabled = true
            btnGuiaPlanilha.disabled = true
        }
        if ( tf > 0 ){
            btnGuiaFaltas.disabled = false
            chkFaltas.disabled = false
        } else {
            btnGuiaFaltas.disabled = true
            chkFaltas.disabled = true 
            chkFaltas.checked = false
        }
        if ( ti > 0 ){
            btnGuiaInscritos.disabled = false
        } else {
            btnGuiaInscritos.disabled = true
        }
        // if ( (te > 0 && tf > 0) ){
        // } else {
        // }
        
        if(!nomeDaGuia){
            $('divGuiaButtons').style.display = 'none'
            txtStatus.value = ''
            txtSiape.value = ''
            radQui0.checked = true
            radVoluntarioCom.checked = true
            dtDia.disabled = true
        } else {
            $('divGuiaButtons').style.display = ''
        }
       
        $('divEscalas').style.display = (nomeDaGuia === 'Escalas' ? '' : 'none')
        $('divFaltas').style.display = (nomeDaGuia === 'Faltas' ? '' : 'none')
        $('divInscritos').style.display = (nomeDaGuia === 'Inscritos' ? '' : 'none')
        $('divPlanilha').style.display = (nomeDaGuia === 'Planilha' ? '' : 'none')
        $('divAvancado').style.display = (nomeDaGuia === 'Avancado' ? '' : 'none')
    }
    function _controlesDaEscala(comando) {
        $('fldPeriodo').disabled = !comando
        $('fldConjunto').disabled = !comando
        $('fldSiape').disabled = !comando
        $('fldGrupo').disabled = !comando
        $('fldEscalaHorario').disabled = !comando
        $('fldOperacao').disabled = !comando
        $('fldGbmDestino').disabled = !comando
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
