document.addEventListener("DOMContentLoaded", () => {
    const conteudoAluno = document.getElementById("conteudoAluno");
    const conteudoProfessor = document.getElementById("conteudoProfessor");
    const irParaProfessor = document.getElementById("irParaProfessor");
    const irParaAluno = document.getElementById("irParaAluno");

    const API_URL = "https://suasala.onrender.com";

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
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senhaAluno").value;
        const msg = document.getElementById("msgAluno");

        msg.textContent = "Verificando dados...";
        msg.style.color = "#d35400";

        try {
            const resposta = await fetch(API_URL + "/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identificacao: email, senha: senha, tipo: "aluno" })
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                msg.textContent = dados.erro;
                msg.style.color = "red";
            } else {
                window.location.href = "pagina/aluno/prof/aluno/aluno.html";
            }
        } catch (erro) {
            msg.textContent = "Erro ao conectar no servidor.";
            msg.style.color = "red";
        }
    });

    document.getElementById("formProfessor").addEventListener("submit", async (e) => {
        e.preventDefault();
        const cpf = document.getElementById("cpf").value;
        const senha = document.getElementById("senhaProf").value;
        const msg = document.getElementById("msgProf");

        msg.textContent = "Verificando dados...";
        msg.style.color = "#d35400";

        try {
            const resposta = await fetch(API_URL + "/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identificacao: cpf, senha: senha, tipo: "professor" })
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                msg.textContent = dados.erro;
                msg.style.color = "red";
            } else {
                window.location.href = "pagina/aluno/prof/professor/professor.html";
            }
        } catch (erro) {
            msg.textContent = "Erro ao conectar no servidor.";
            msg.style.color = "red";
        }
    });
});