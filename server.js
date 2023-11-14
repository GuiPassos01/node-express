import express from 'express';
import bodyParser from 'body-parser';
import pool from './db.js';

const app = express();

app.use(bodyParser.json());

// Lista todos os alunos
app.get("/api/students", async (req, res) => {
    try {
        const connection = await pool.connect();

        const result = await connection.query("SELECT * FROM students ORDER BY name");

        connection.release();

        const students = result.rows;

        // Envia a resposta apenas com os dados dos alunos
        res.send({
            students: students,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao acessar o banco de dados.");
    }
});

// Cria um novo aluno
app.post("/api/students", async (req, res) => {
    // Obtém os dados da solicitação
    const name = req.body.name;
    const email = req.body.email;
    const age = req.body.age;
    const dob = req.body.dob;

    // Valida os dados
    if (!name) {
        res.status(400).send("O nome é obrigatório.");
        return;
    }

    const connection = await pool.connect();

    // Insere o aluno no banco de dados
    connection.query(
        "INSERT INTO students (name, email, age, dob) VALUES ($1, $2, $3, $4)",
        [name, email, age, dob],
        (err, result) => {
            connection.release();

            if (err) {
                console.error(err);
                res.status(500).send("Erro ao acessar o banco de dados.");
                return;
            }

            // Envia a resposta
            res.send({
                student: result.insertId,
            });
        }
    );
});

//Altera os dados dos alunos
app.put('/api/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const { name, email, age, dob } = req.body;

        const connection = await pool.connect();

        // Atualiza o aluno no banco de dados
        await connection.query(
            "UPDATE students SET name = $1, email = $2, age = $3, dob = $4 WHERE id = $5",
            [name, email, age, dob, studentId]
        );

        connection.release();

        // Envia a resposta com status 204 (Sem Conteúdo)
        res.status(204)
        } catch (error) {
        console.error(error);
        res.status(500)
    }
});

// Inicia o servidor
app.listen(3000, () => {
    console.log("Servidor iniciado na porta 3000.");
});
