require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ---------- LOGIN ----------
app.post('/login', async (req, res) => {
    const { identificacao, senha, tipo } = req.body;

    try {
        if (tipo === 'aluno') {
            const resultado = await pool.query(
                'SELECT * FROM alunos WHERE email = $1',
                [identificacao]
            );
            const aluno = resultado.rows[0];

            if (!aluno) {
                return res.status(401).json({ erro: 'E-mail nao cadastrado.' });
            }
            if (!aluno.ativo) {
                return res.status(403).json({ erro: 'Conta inativa.' });
            }

            const senhaCorreta = await bcrypt.compare(senha, aluno.senha_hash);
            if (!senhaCorreta) {
                return res.status(401).json({ erro: 'Senha incorreta.' });
            }

            return res.status(200).json({
                mensagem: 'Login realizado com sucesso.',
                nome: aluno.nome_completo
            });

        } else if (tipo === 'professor') {
            const resultado = await pool.query(
                'SELECT * FROM professores WHERE cpf = $1',
                [identificacao]
            );
            const professor = resultado.rows[0];

            if (!professor) {
                return res.status(401).json({ erro: 'CPF nao cadastrado.' });
            }
            if (!professor.ativo) {
                return res.status(403).json({ erro: 'Conta inativa.' });
            }

            const senhaCorreta = await bcrypt.compare(senha, professor.senha_hash);
            if (!senhaCorreta) {
                return res.status(401).json({ erro: 'Senha incorreta.' });
            }

            return res.status(200).json({
                mensagem: 'Login realizado com sucesso.',
                nome: professor.nome_completo
            });

        } else {
            return res.status(400).json({ erro: 'Tipo de usuario invalido.' });
        }
    } catch (erro) {
        console.error('--- ERRO NO LOGIN ---');
        console.error(erro.message);
        console.error('----------------------');
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

// ---------- CADASTRO ----------
app.post('/cadastro', async (req, res) => {
    const { tipo, nomeCompleto, senha } = req.body;

    if (!tipo || !nomeCompleto || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatorios.' });
    }
    if (senha.length < 6) {
        return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        if (tipo === 'aluno') {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ erro: 'E-mail e obrigatorio.' });
            }

            const existe = await pool.query('SELECT id FROM alunos WHERE email = $1', [email]);
            if (existe.rows.length > 0) {
                return res.status(409).json({ erro: 'Ja existe uma conta com esse e-mail.' });
            }

            await pool.query(
                'INSERT INTO alunos (nome_completo, senha_hash, email) VALUES ($1, $2, $3)',
                [nomeCompleto, senhaHash, email]
            );

            return res.status(201).json({ mensagem: 'Conta de aluno criada com sucesso.' });

        } else if (tipo === 'professor') {
            const { cpf, telefone } = req.body;
            if (!cpf) {
                return res.status(400).json({ erro: 'CPF e obrigatorio.' });
            }

            const existe = await pool.query('SELECT id FROM professores WHERE cpf = $1', [cpf]);
            if (existe.rows.length > 0) {
                return res.status(409).json({ erro: 'Ja existe uma conta com esse CPF.' });
            }

            await pool.query(
                'INSERT INTO professores (nome_completo, cpf, telefone, senha_hash) VALUES ($1, $2, $3, $4)',
                [nomeCompleto, cpf, telefone || null, senhaHash]
            );

            return res.status(201).json({ mensagem: 'Conta de professor criada com sucesso.' });

        } else {
            return res.status(400).json({ erro: 'Tipo de usuario invalido.' });
        }
    } catch (erro) {
        console.error('--- ERRO NO CADASTRO ---');
        console.error(erro.message);
        console.error('------------------------');
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} (login + cadastro, sem auto-cadastro no login)`);
});