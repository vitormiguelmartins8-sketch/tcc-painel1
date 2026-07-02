require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com o banco 'suasala'
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'suasala',
    password: 'verinaud1985',
    port: 5432,
});

app.post('/login', async (req, res) => {
    const { identificacao, senha } = req.body;

    if (!identificacao || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    try {
        let usuario = null;
        let tipoUsuario = ''; // 'alunos' ou 'professores'
        const termoBusca = identificacao.trim();
        const ehAluno = termoBusca.includes('@');

        // Criptografa a senha caso precise criar ou atualizar o usuário
        const saltRounds = 10;
        const senhaHashGerado = await bcrypt.hash(senha, saltRounds);

        // ==========================================
        // 1. FLUXO PARA ALUNOS (Identificado por Gmail)
        // ==========================================
        if (ehAluno) {
            tipoUsuario = 'alunos';
            const emailFormatado = termoBusca.toLowerCase();

            // Busca se o aluno já existe
            const busca = await pool.query('SELECT * FROM alunos WHERE email = $1', [emailFormatado]);

            if (busca.rows.length > 0) {
                usuario = busca.rows[0];
            } else {
                // SÃO SALVOS AUTOMATICAMENTE SE NÃO EXISTIREM:
                console.log(`[AUTO-CADASTRO] Criando novo aluno: ${emailFormatado}`);
                
                // Cria um nome fictício baseado no e-mail (ex: "Usuario 00001108...")
                const nomeFicticio = `Usuário ${emailFormatado.split('@')[0]}`;
                
                const novoAluno = await pool.query(
                    'INSERT INTO alunos (nome_completo, email, senha_hash, ativo) VALUES ($1, $2, $3, true) RETURNING *',
                    [nomeFicticio, emailFormatado, senhaHashGerado]
                );
                usuario = novoAluno.rows[0];
            }
        } 
        // ==========================================
        // 2. FLUXO PARA PROFESSORES (Identificado por RG)
        // ==========================================
        else {
            tipoUsuario = 'professores';

            // Busca se o professor já existe
            const busca = await pool.query('SELECT * FROM professores WHERE rg = $1', [termoBusca]);

            if (busca.rows.length > 0) {
                usuario = busca.rows[0];
            } else {
                // SÃO SALVOS AUTOMATICAMENTE SE NÃO EXISTIREM:
                console.log(`[AUTO-CADASTRO] Criando novo professor RG: ${termoBusca}`);
                
                const nomeFicticio = `Professor RG ${termoBusca}`;
                
                const novoProfessor = await pool.query(
                    'INSERT INTO professores (nome_completo, rg, senha_hash, ativo) VALUES ($1, $2, $3, true) RETURNING *',
                    [nomeFicticio, termoBusca, senhaHashGerado]
                );
                usuario = novoProfessor.rows[0];
            }
        }

        // ==========================================
        // 3. VALIDAÇÃO DE ACESSO / SENHA
        // ==========================================
        if (usuario.ativo === false) {
            return res.status(403).json({ erro: 'Este usuário está desativado.' });
        }

        // Se o usuário acabou de ser criado, a senha já bate perfeitamente.
        // Se ele já existia, o sistema confere se a senha digitada bate com a guardada.
        let senhaValida = false;
        try {
            senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        } catch (e) {
            senhaValida = (usuario.senha_hash === senha);
        }

        // Se a senha estiver correta (ou for nova), loga direto!
        if (senhaValida || !usuario.senha_hash) {
            return res.json({ 
                sucesso: true, 
                mensagem: 'Acesso liberado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome_completo,
                    tipo: tipoUsuario
                }
            });
        } else {
            return res.status(401).json({ erro: 'Senha incorreta para este usuário.' });
        }

    } catch (err) {
        console.error('--- ERRO NO SERVIDOR ---');
        console.error(err.message);
        console.error('------------------------');
        res.status(500).json({ erro: 'Erro interno no banco de dados.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando com AUTO-CADASTRO ATIVADO na porta ${PORT}`);
});