const cmdEscalas = document.getElementById("cmdEscalas")
const cmdFaltas = document.getElementById("cmdFaltas")
const cmdInscritos = document.getElementById("cmdInscritos")

cmdEscalas.addEventListener("click", (e)=>{
    window.location.href = "./escalas"
})
cmdFaltas.addEventListener("click", (e)=>{
    window.location.href = "./faltas"
})
cmdInscritos.addEventListener("click", (e)=>{
    window.location.href = "./inscritos"
})

