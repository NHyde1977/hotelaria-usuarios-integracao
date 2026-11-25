import { randomUUID } from 'crypto'
import pool from '../database/connection.js'

class UsuarioRepository {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        id,
        nome,
        email,
        cpf,
        data_nascimento,
        sexo,
        telefone,
        status,
        data_criacao,
        data_atualizacao
      FROM usuario
      ORDER BY nome
    `)

    return rows
  }

  async findById(id) {
    const [rows] = await pool.execute(`
      SELECT
        id,
        nome,
        email,
        cpf,
        data_nascimento,
        sexo,
        telefone,
        status,
        data_criacao,
        data_atualizacao
      FROM usuario
      WHERE id = ?
    `, [id])

    return rows[0] ?? null
  }

  async findByEmail(email) {
    const [rows] = await pool.execute(`
      SELECT
        id,
        nome,
        email,
        cpf,
        data_nascimento,
        sexo,
        telefone,
        status,
        data_criacao,
        data_atualizacao
      FROM usuario
      WHERE email = ?
    `, [email])

    return rows[0] ?? null
  }

  async findByCpf(cpf) {
    const [rows] = await pool.execute(`
      SELECT
        id,
        nome,
        email,
        cpf,
        data_nascimento,
        sexo,
        telefone,
        status,
        data_criacao,
        data_atualizacao
      FROM usuario
      WHERE cpf = ?
    `, [cpf])

    return rows[0] ?? null
  }

  async create({
  nome,
  email,
  senha_hash,
  cpf,
  data_nascimento,
  sexo,
  telefone,
  status = 'ATIVO'
}) {
  const id = randomUUID()
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    await connection.execute(`
      INSERT INTO usuario (
        id,
        nome,
        email,
        senha_hash,
        cpf,
        data_nascimento,
        sexo,
        telefone,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      nome,
      email,
      senha_hash,
      cpf,
      data_nascimento,
      sexo,
      telefone ?? null,
      status
    ])

    const [resultado] = await connection.execute(`
      INSERT INTO usuario_role (usuario_id, role_id)
      SELECT ?, id FROM role WHERE nome = 'HOSPEDE'
    `, [id])

    if (resultado.affectedRows !== 1) {
      throw new Error('Perfil HOSPEDE nao configurado corretamente')
    }

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }

  return this.findById(id)
}

  async update(id, {
    nome,
    email,
    cpf,
    data_nascimento,
    sexo,
    telefone,
    status
  }) {
    const [result] = await pool.execute(`
      UPDATE usuario
      SET
        nome = ?,
        email = ?,
        cpf = ?,
        data_nascimento = ?,
        sexo = ?,
        telefone = ?,
        status = COALESCE(?, status)
      WHERE id = ?
    `, [
      nome,
      email,
      cpf,
      data_nascimento,
      sexo,
      telefone ?? null,
      status ?? null,
      id
    ])

    if (result.affectedRows === 0) {
      return null
    }

    return this.findById(id)
  }

  async findSenhaHashById(id) {
    const [rows] = await pool.execute(`
      SELECT senha_hash
      FROM usuario
      WHERE id = ?
    `, [id])

    return rows[0]?.senha_hash ?? null
  }

  async updatePassword(id, senha_hash) {
    const [result] = await pool.execute(`
      UPDATE usuario
      SET senha_hash = ?
      WHERE id = ?
    `, [senha_hash, id])

    if (result.affectedRows === 0) {
      return null
    }

    return this.findById(id)
  }

  async updateStatus(id, status) {
    const [result] = await pool.execute(`
      UPDATE usuario
      SET status = ?
      WHERE id = ?
    `, [status, id])

    if (result.affectedRows === 0) {
      return null
    }

    return this.findById(id)
  }

  async delete(id) {
    const [result] = await pool.execute(`
      DELETE FROM usuario
      WHERE id = ?
    `, [id])

    return result.affectedRows > 0
  }

  async findRolesByUsuarioId(usuarioId) {
    const [rows] = await pool.execute(`
      SELECT r.nome
      FROM role r
      INNER JOIN usuario_role ur ON ur.role_id = r.id
      WHERE ur.usuario_id = ?
      ORDER BY r.nome
    `, [usuarioId])

    return rows.map(row => row.nome)
  }
}
export default new UsuarioRepository()