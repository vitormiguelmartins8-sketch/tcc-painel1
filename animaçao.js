document.addEventListener("DOMContentLoaded", () => {
    const conteudoAluno = document.getElementById("conteudoAluno");
    const conteudoProfessor = document.getElementById("conteudoProfessor");
    const irParaProfessor = document.getElementById("irParaProfessor");
    const irParaAluno = document.getElementById("irParaAluno");

    function alternarTela(telaParaEsconder, telaParaMostrar) {
        telaParaEsconder.style.opacity = "0";
        
        setTimeout(() => {
            telaParaEsconder.classList.remove("ativo");
            telaParaMostrar.classList.add("ativo");
            
            setTimeout(() => {
                telaParaMostrar.style.opacity = "1";
            }, 50);
        }, 400);
    }

    irParaProfessor.addEventListener("click", () => {
        alternarTela(conteudoAluno, conteudoProfessor);
    });

    irParaAluno.addEventListener("click", () => {
        alternarTela(conteudoProfessor, conteudoAluno);
    });

    document.getElementById("formAluno").addEventListener("submit", async (e) => {
        e.preventDefault();
        const ra = document.getElementById("ra").value;
        const senha = document.getElementById("senhaAluno").value;
        const msg = document.getElementById("msgAluno");

        msg.textContent = "Verificando dados...";
        msg.style.color = "#d35400";

        try {
            const resposta = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identificacao: ra, senha, tipo: 'aluno' })
            });
            const dados = await resposta.json();

            if (!resposta.ok) { 
                msg.textContent = dados.erro; 
                msg.style.color = "red"; 
            } else { 
                fazerTransicaoDePagina("pagina/aluno/prof/aluno/aluno.html"); 
            }
        } catch { 
            msg.textContent = "Erro ao conectar no servidor."; 
            msg.style.color = "red"; 
        }
    });

    document.getElementById("formProfessor").addEventListener("submit", async (e) => {
        e.preventDefault();
        const rg = document.getElementById("rg").value;
        const senha = document.getElementById("senhaProf").value;
        const msg = document.getElementById("msgProf");

        msg.textContent = "Verificando dados...";
        msg.style.color = "#d35400";    